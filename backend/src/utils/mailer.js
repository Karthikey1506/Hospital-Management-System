// Email Notification Utility Service
// Supports simulated SMTP dispatch & HTML template generation for clinical notifications

function sendAppointmentEmail({ patientName, patientEmail, doctorName, date, timeSlot, appointmentCode }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #0b0f19; color: #f1f5f9; border-radius: 12px;">
      <h2 style="color: #00F2FE;">MedPulse Care Hospital - Appointment Confirmation</h2>
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>Your outpatient appointment has been successfully booked!</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #334155;">Token Code:</td><td style="padding: 8px; border-bottom: 1px solid #334155; font-weight: bold; color: #00F2FE;">${appointmentCode}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #334155;">Attending Doctor:</td><td style="padding: 8px; border-bottom: 1px solid #334155;">${doctorName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #334155;">Date & Slot:</td><td style="padding: 8px; border-bottom: 1px solid #334155;">${date} at ${timeSlot}</td></tr>
      </table>
      <p style="color: #94a3b8; font-size: 0.85rem;">Please arrive 15 minutes before your time slot. Bring your ID and previous medical records.</p>
    </div>
  `;

  console.log(`[EMAIL DISPATCH] Sent Appointment Confirmation to ${patientEmail || patientName} (${appointmentCode})`);
  return { success: true, messageId: `msg_${Date.now()}`, recipient: patientName, html: htmlContent };
}

function sendLabReportEmail({ patientName, patientEmail, testName, testCode, result }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #0b0f19; color: #f1f5f9; border-radius: 12px;">
      <h2 style="color: #10B981;">MedPulse Pathology - Diagnostic Test Result Ready</h2>
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>Your diagnostic test <strong>${testName} (${testCode})</strong> results are ready.</p>
      <div style="background: rgba(16, 185, 129, 0.1); padding: 12px; border-left: 4px solid #10B981; margin: 15px 0;">
        <strong>Result Summary:</strong> ${result}
      </div>
      <p style="color: #94a3b8; font-size: 0.85rem;">Log into MedPulse Care Portal to view or download the signed PDF report.</p>
    </div>
  `;

  console.log(`[EMAIL DISPATCH] Sent Lab Report Alert to ${patientEmail || patientName} (${testCode})`);
  return { success: true, messageId: `msg_${Date.now()}`, recipient: patientName, html: htmlContent };
}

module.exports = {
  sendAppointmentEmail,
  sendLabReportEmail
};
