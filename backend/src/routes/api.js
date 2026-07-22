const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('../db');
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validatePatientInput, validateAppointmentInput } = require('../middleware/validate');
const { sendAppointmentEmail, sendLabReportEmail } = require('../utils/mailer');

const router = express.Router();

// Robust Helper for Audit Logging
function recordAudit(req, action, entity, details) {
  try {
    const user = req && req.user ? req.user : (req && req.userObj ? req.userObj : null);
    const headers = req && req.headers ? req.headers : {};
    const ipAddress = headers['x-forwarded-for'] || (req && req.ip) || '127.0.0.1';

    db.logAudit({
      userId: user ? user.id : 'ANONYMOUS',
      userName: user ? user.name : 'System User',
      userRole: user ? user.role : 'GUEST',
      action,
      entity,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to log audit action:', err);
  }
}

// Helper for Pagination
function paginateArray(array, page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 10);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const total = array.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const data = array.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    }
  };
}

// ==========================================
// 1. AUTHENTICATION & LOGIN
// ==========================================
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.findWhere('users', u => u.email.toLowerCase() === (email || '').toLowerCase())[0];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  recordAudit(req, 'USER_LOGIN', 'Auth', `User ${user.name} logged in with role ${user.role}`);

  return res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

router.get('/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 2. PATIENTS EMR APIs (With Pagination & Audit Logs)
// ==========================================
router.get('/patients', authenticateToken, (req, res) => {
  let patients = db.getCollection('patients');
  const { search, triageLevel, status, page, limit } = req.query;

  if (search) {
    const q = search.toLowerCase();
    patients = patients.filter(p => p.name.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q));
  }
  if (triageLevel) {
    patients = patients.filter(p => p.triageLevel === triageLevel);
  }
  if (status) {
    patients = patients.filter(p => p.status === status);
  }

  if (page || limit) {
    return res.json(paginateArray(patients, page, limit));
  }

  res.json(patients);
});

router.get('/patients/:id', authenticateToken, (req, res) => {
  const patient = db.findById('patients', req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const prescriptions = db.findWhere('prescriptions', p => String(p.patientId) === String(patient.id));
  const labTests = db.findWhere('lab_tests', l => String(l.patientId) === String(patient.id));
  const bills = db.findWhere('bills', b => String(b.patientId) === String(patient.id));
  const appointments = db.findWhere('appointments', a => String(a.patientId) === String(patient.id));

  res.json({
    ...patient,
    prescriptions,
    labTests,
    bills,
    appointments
  });
});

router.post('/patients', authenticateToken, requireRole(['ADMIN', 'RECEPTIONIST']), validatePatientInput, (req, res) => {
  const count = db.getCollection('patients').length + 1001;
  const newPatient = {
    patientId: `PT-${count}`,
    ...req.body,
    status: req.body.status || 'Outpatient',
    triageLevel: req.body.triageLevel || 'GREEN'
  };

  const created = db.insert('patients', newPatient);
  recordAudit(req, 'CREATE_PATIENT', 'Patients', `Registered new patient ${created.name} (${created.patientId})`);

  res.status(201).json(created);
});

router.put('/patients/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), (req, res) => {
  const updated = db.update('patients', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Patient not found' });

  recordAudit(req, 'UPDATE_PATIENT', 'Patients', `Updated EMR record for patient ${updated.name}`);
  res.json(updated);
});

router.delete('/patients/:id', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  const pt = db.findById('patients', req.params.id);
  const success = db.delete('patients', req.params.id);
  if (!success) return res.status(404).json({ error: 'Patient not found' });

  recordAudit(req, 'DELETE_PATIENT', 'Patients', `Archived patient record ${pt ? pt.name : req.params.id}`);
  res.json({ message: 'Patient record deleted successfully' });
});

// ==========================================
// 3. MULTER FILE UPLOAD APIs
// ==========================================
router.post('/upload/lab-report', authenticateToken, requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or file format rejected.' });
  }

  const { labTestId, patientId } = req.body;
  const relativeUrl = `/uploads/lab-reports/${req.file.filename}`;

  if (labTestId) {
    db.update('lab_tests', labTestId, { reportFileUrl: relativeUrl, status: 'Completed' });
  }

  recordAudit(req, 'FILE_UPLOADED', 'Lab & Diagnostics', `Uploaded file ${req.file.originalname} (${req.file.size} bytes)`);

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    fileUrl: relativeUrl,
    size: req.file.size
  });
});

router.post('/upload/patient-avatar/:id', authenticateToken, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  const avatarUrl = `/uploads/profiles/${req.file.filename}`;
  const updated = db.update('patients', req.params.id, { avatarUrl });

  recordAudit(req, 'AVATAR_UPLOADED', 'Patients', `Uploaded avatar photo for patient ${req.params.id}`);

  res.json({ message: 'Profile photo updated', avatarUrl, patient: updated });
});

// ==========================================
// 4. SYSTEM AUDIT LOGS API
// ==========================================
router.get('/audit-logs', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req, res) => {
  const logs = db.getCollection('audit_logs');
  const { action, search, page, limit } = req.query;

  let filtered = logs;
  if (action) {
    filtered = filtered.filter(l => l.action === action);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l => l.userName.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.action.toLowerCase().includes(q));
  }

  if (page || limit) {
    return res.json(paginateArray(filtered, page, limit));
  }

  res.json(filtered);
});

// ==========================================
// 5. DOCTORS & DEPARTMENTS APIs
// ==========================================
router.get('/doctors', authenticateToken, (req, res) => {
  const doctors = db.getCollection('doctors');
  const departments = db.getCollection('departments');
  
  const enriched = doctors.map(doc => {
    const dept = departments.find(d => d.id === doc.departmentId);
    return { ...doc, departmentName: dept ? dept.name : 'General' };
  });

  res.json(enriched);
});

router.get('/departments', authenticateToken, (req, res) => {
  res.json(db.getCollection('departments'));
});

// ==========================================
// 6. APPOINTMENTS APIs (With Mailer Hook)
// ==========================================
router.get('/appointments', authenticateToken, (req, res) => {
  const appointments = db.getCollection('appointments');
  const patients = db.getCollection('patients');
  const doctors = db.getCollection('doctors');

  const enriched = appointments.map(apt => {
    const pt = patients.find(p => String(p.id) === String(apt.patientId));
    const doc = doctors.find(d => String(d.id) === String(apt.doctorId));
    return {
      ...apt,
      patientName: pt ? pt.name : 'Unknown Patient',
      doctorName: doc ? doc.name : 'Unassigned Doctor'
    };
  });

  const { page, limit } = req.query;
  if (page || limit) {
    return res.json(paginateArray(enriched, page, limit));
  }

  res.json(enriched);
});

router.post('/appointments', authenticateToken, requireRole(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), validateAppointmentInput, (req, res) => {
  const count = db.getCollection('appointments').length + 901;
  const newAppointment = {
    appointmentCode: `APT-${count}`,
    ...req.body,
    status: req.body.status || 'Waiting'
  };
  const created = db.insert('appointments', newAppointment);

  const pt = db.findById('patients', created.patientId);
  const doc = db.findById('doctors', created.doctorId);

  sendAppointmentEmail({
    patientName: pt ? pt.name : 'Patient',
    patientEmail: pt ? pt.phone : 'patient@example.com',
    doctorName: doc ? doc.name : 'Attending Physician',
    date: created.date,
    timeSlot: created.timeSlot,
    appointmentCode: created.appointmentCode
  });

  recordAudit(req, 'BOOK_APPOINTMENT', 'Appointments', `Booked appointment ${created.appointmentCode} for ${pt ? pt.name : 'Patient'}`);

  res.status(201).json(created);
});

router.patch('/appointments/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const updated = db.update('appointments', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Appointment not found' });

  recordAudit(req, 'UPDATE_APPOINTMENT_STATUS', 'Appointments', `Updated status to '${status}' for appointment #${req.params.id}`);
  res.json(updated);
});

// ==========================================
// 7. BEDS & WARD ALLOCATION APIs
// ==========================================
router.get('/beds', authenticateToken, (req, res) => {
  const beds = db.getCollection('beds');
  const patients = db.getCollection('patients');

  const enriched = beds.map(bed => {
    const pt = bed.patientId ? patients.find(p => String(p.id) === String(bed.patientId)) : null;
    return {
      ...bed,
      patientName: pt ? pt.name : null
    };
  });

  res.json(enriched);
});

router.patch('/beds/:id/status', authenticateToken, requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), (req, res) => {
  const { status, patientId } = req.body;
  const updated = db.update('beds', req.params.id, { 
    status, 
    patientId: status === 'OCCUPIED' ? patientId : null 
  });
  if (!updated) return res.status(404).json({ error: 'Bed not found' });

  recordAudit(req, 'ALLOCATE_BED', 'Beds & Wards', `Bed ${updated.bedNumber} status changed to ${status}`);
  res.json(updated);
});

// ==========================================
// 8. PHARMACY & PRESCRIPTIONS APIs
// ==========================================
router.get('/medicines', authenticateToken, (req, res) => {
  res.json(db.getCollection('medicines'));
});

router.get('/prescriptions', authenticateToken, (req, res) => {
  const prescriptions = db.getCollection('prescriptions');
  const patients = db.getCollection('patients');
  const doctors = db.getCollection('doctors');

  const enriched = prescriptions.map(p => {
    const pt = patients.find(ptItem => String(ptItem.id) === String(p.patientId));
    const doc = doctors.find(d => String(d.id) === String(p.doctorId));
    return {
      ...p,
      patientName: pt ? pt.name : 'Unknown',
      doctorName: doc ? doc.name : 'Unknown Doctor'
    };
  });

  res.json(enriched);
});

router.post('/prescriptions', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req, res) => {
  const count = db.getCollection('prescriptions').length + 7701;
  const newRx = {
    prescriptionId: `RX-${count}`,
    ...req.body
  };
  const created = db.insert('prescriptions', newRx);

  recordAudit(req, 'CREATE_PRESCRIPTION', 'Pharmacy', `Issued prescription ${created.prescriptionId}`);
  res.status(201).json(created);
});

// ==========================================
// 9. LAB TESTS APIs (With Email Notification)
// ==========================================
router.get('/lab-tests', authenticateToken, (req, res) => {
  const tests = db.getCollection('lab_tests');
  const patients = db.getCollection('patients');

  const enriched = tests.map(t => {
    const pt = patients.find(p => String(p.id) === String(t.patientId));
    return {
      ...t,
      patientName: pt ? pt.name : 'Unknown'
    };
  });

  res.json(enriched);
});

router.post('/lab-tests', authenticateToken, requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), (req, res) => {
  const count = db.getCollection('lab_tests').length + 401;
  const newTest = {
    testCode: `LAB-${count}`,
    status: 'Pending',
    ...req.body
  };
  const created = db.insert('lab_tests', newTest);

  recordAudit(req, 'ORDER_LAB_TEST', 'Lab & Diagnostics', `Ordered lab test ${created.testCode}`);
  res.status(201).json(created);
});

router.put('/lab-tests/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req, res) => {
  const updated = db.update('lab_tests', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Lab test not found' });

  if (req.body.status === 'Completed' && req.body.result) {
    const pt = db.findById('patients', updated.patientId);
    sendLabReportEmail({
      patientName: pt ? pt.name : 'Patient',
      patientEmail: pt ? pt.phone : 'patient@example.com',
      testName: updated.testName,
      testCode: updated.testCode,
      result: updated.result
    });
  }

  recordAudit(req, 'UPDATE_LAB_TEST', 'Lab & Diagnostics', `Updated result for lab test ${updated.testCode}`);
  res.json(updated);
});

// ==========================================
// 10. BILLING & INVOICING APIs
// ==========================================
router.get('/billing', authenticateToken, (req, res) => {
  const bills = db.getCollection('bills');
  const { page, limit } = req.query;
  if (page || limit) {
    return res.json(paginateArray(bills, page, limit));
  }
  res.json(bills);
});

router.post('/billing', authenticateToken, requireRole(['ADMIN', 'RECEPTIONIST']), (req, res) => {
  const count = db.getCollection('bills').length + 1;
  const invoiceNumber = `INV-2026-${String(count).padStart(3, '0')}`;
  
  const subtotal = (Number(req.body.consultationFee) || 0) +
                   (Number(req.body.bedCharge) || 0) +
                   (Number(req.body.labCharge) || 0) +
                   (Number(req.body.pharmacyCharge) || 0);

  const discount = Number(req.body.discount) || 0;
  const totalAmount = Math.max(0, subtotal - discount);

  const newBill = {
    invoiceNumber,
    ...req.body,
    subtotal,
    totalAmount,
    status: req.body.status || 'PENDING'
  };

  const created = db.insert('bills', newBill);
  recordAudit(req, 'GENERATE_BILL', 'Billing', `Generated invoice ${created.invoiceNumber} for ₹${totalAmount}`);

  res.status(201).json(created);
});

// ==========================================
// 11. EXECUTIVE ANALYTICS AGGREGATOR API
// ==========================================
router.get('/analytics', authenticateToken, (req, res) => {
  const beds = db.getCollection('beds');
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const totalBeds = beds.length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const bills = db.getCollection('bills');
  const totalRevenue = bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const pendingRevenue = bills.filter(b => b.status === 'PENDING').reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const appointments = db.getCollection('appointments');
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
  const totalAppointments = appointments.length;
  const appointmentCompletionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  const patients = db.getCollection('patients');
  const activePatients = patients.filter(p => p.status === 'Admitted').length;

  const departments = db.getCollection('departments');
  const doctors = db.getCollection('doctors');

  const departmentStats = departments.map(d => {
    const deptDocs = doctors.filter(doc => doc.departmentId === d.id);
    const totalPatientsCount = deptDocs.reduce((acc, doc) => acc + (doc.patientsCount || 0), 0);
    return {
      name: d.name,
      doctorCount: deptDocs.length,
      patientCount: totalPatientsCount
    };
  });

  const revenueTrends = [
    { month: 'Jan', revenue: 142000 },
    { month: 'Feb', revenue: 185000 },
    { month: 'Mar', revenue: 210000 },
    { month: 'Apr', revenue: 198000 },
    { month: 'May', revenue: 264000 },
    { month: 'Jun', revenue: 310000 },
    { month: 'Jul', revenue: totalRevenue + 120000 }
  ];

  res.json({
    occupancyRate,
    occupiedBeds,
    totalBeds,
    totalRevenue,
    pendingRevenue,
    appointmentCompletionRate,
    completedAppointments,
    totalAppointments,
    activePatients,
    departmentStats,
    revenueTrends
  });
});

module.exports = router;
