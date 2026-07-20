// Input Validation Middleware

function validatePatientInput(req, res, next) {
  const { name, phone, age } = req.body;
  
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Patient name must be at least 2 characters long.' });
  }

  if (age && (isNaN(age) || age < 0 || age > 130)) {
    return res.status(400).json({ success: false, error: 'Invalid age value.' });
  }

  if (phone) {
    const phoneRegex = /^(\+91[\-\s]?)?[0-9]{10}$/;
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (!phoneRegex.test(phone) && !/^\d{10,12}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid Indian phone number format. Provide 10-digit number.' });
    }
  }

  next();
}

function validateAppointmentInput(req, res, next) {
  const { patientId, doctorId, date } = req.body;

  if (!patientId || !doctorId || !date) {
    return res.status(400).json({ success: false, error: 'patientId, doctorId, and date are required fields.' });
  }

  next();
}

module.exports = {
  validatePatientInput,
  validateAppointmentInput
};
