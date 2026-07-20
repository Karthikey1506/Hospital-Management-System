const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

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
// 2. PATIENTS EMR APIs
// ==========================================
router.get('/patients', authenticateToken, (req, res) => {
  let patients = db.getCollection('patients');
  const { search, triageLevel, status } = req.query;

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

  res.json(patients);
});

router.get('/patients/:id', authenticateToken, (req, res) => {
  const patient = db.findById('patients', req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Attach related data (relational joins)
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

router.post('/patients', authenticateToken, requireRole(['ADMIN', 'RECEPTIONIST']), (req, res) => {
  const count = db.getCollection('patients').length + 1001;
  const newPatient = {
    patientId: `PT-${count}`,
    ...req.body,
    status: req.body.status || 'Outpatient',
    triageLevel: req.body.triageLevel || 'GREEN'
  };

  const created = db.insert('patients', newPatient);
  res.status(201).json(created);
});

router.put('/patients/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), (req, res) => {
  const updated = db.update('patients', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Patient not found' });
  res.json(updated);
});

router.delete('/patients/:id', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  const success = db.delete('patients', req.params.id);
  if (!success) return res.status(404).json({ error: 'Patient not found' });
  res.json({ message: 'Patient record deleted successfully' });
});

// ==========================================
// 3. DOCTORS & DEPARTMENTS APIs
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
// 4. APPOINTMENTS APIs
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

  res.json(enriched);
});

router.post('/appointments', authenticateToken, requireRole(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), (req, res) => {
  const count = db.getCollection('appointments').length + 901;
  const newAppointment = {
    appointmentCode: `APT-${count}`,
    ...req.body,
    status: req.body.status || 'Waiting'
  };
  const created = db.insert('appointments', newAppointment);
  res.status(201).json(created);
});

router.patch('/appointments/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const updated = db.update('appointments', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Appointment not found' });
  res.json(updated);
});

// ==========================================
// 5. BEDS & WARD ALLOCATION APIs
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
  res.json(updated);
});

// ==========================================
// 6. PHARMACY & PRESCRIPTIONS APIs
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
  res.status(201).json(created);
});

// ==========================================
// 7. LAB TESTS APIs
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
  res.status(201).json(created);
});

router.put('/lab-tests/:id', authenticateToken, requireRole(['ADMIN', 'DOCTOR']), (req, res) => {
  const updated = db.update('lab_tests', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Lab test not found' });
  res.json(updated);
});

// ==========================================
// 8. BILLING & INVOICING APIs
// ==========================================
router.get('/billing', authenticateToken, (req, res) => {
  res.json(db.getCollection('bills'));
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
  res.status(201).json(created);
});

// ==========================================
// 9. EXECUTIVE ANALYTICS AGGREGATOR API
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
    { month: 'Jan', revenue: 14200 },
    { month: 'Feb', revenue: 18500 },
    { month: 'Mar', revenue: 21000 },
    { month: 'Apr', revenue: 19800 },
    { month: 'May', revenue: 26400 },
    { month: 'Jun', revenue: 31000 },
    { month: 'Jul', revenue: totalRevenue + 12000 }
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
