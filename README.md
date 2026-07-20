# MedPulse Enterprise Hospital Management System 🏥

A full-stack, enterprise-grade Hospital Management System built with **React 18**, **Vite**, **Node.js + Express REST APIs**, **Prisma ORM & SQL Relational Database**, **JWT Authentication with Role-Based Access Control (RBAC)**, **Recharts Analytics**, **PDF Invoicing**, and **CSV Export** capabilities.

---

## 🌟 Key Features

1. **Executive Analytics Command Center**: Real-time KPI telemetry (Occupancy %, Revenue trends, department patient distribution, appointment completion rate).
2. **Electronic Medical Records (EMR)**: Searchable patient directory, demographics, triage levels (`RED`, `YELLOW`, `GREEN`), vitals history, and CSV data export.
3. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full access, physician management, patient deletion, database management.
   - **Doctor**: E-Prescription issuing, lab diagnostics order creation, patient profile access.
   - **Receptionist**: Patient intake, appointment booking, bed allocation, invoice generation.
4. **Visual Ward & Bed Allocation Grid**: Real-time bed occupancy grid across ICU, Private Suites, General Wards, and Emergency Bay.
5. **PDF Invoice Generator**: Itemized bill breakdown (consultation, room stay, lab tests, pharmacy) rendered into downloadable official hospital PDF receipts using `jsPDF`.
6. **Pharmacy & E-Prescriptions**: Stock level monitoring, low-stock warnings, and digital prescription history.
7. **Emergency Triage & Dispatch Desk**: Color-coded triage priority management and mobile ambulance fleet dispatch simulator.

---

## 🗄️ Database Architecture (SQL & Prisma Schema)

```
[ User ] (id, email, password, name, role: ADMIN | DOCTOR | RECEPTIONIST)
   │
   ├──► [ Doctor ] (id, departmentId, specialization, licenseNumber, availability, onCall)
   │
[ Department ] ◄─── [ Doctor ]
   │
   └──► [ Patient ] (id, patientId, name, age, gender, bloodGroup, triageLevel, medicalHistory)
           │
           ├──► [ Appointment ] (id, appointmentCode, doctorId, date, timeSlot, priority, status)
           ├──► [ Bed ] (id, bedNumber, wardType, status: OCCUPIED | AVAILABLE | CLEANING, patientId)
           ├──► [ Prescription ] (id, prescriptionId, doctorId, diagnosis, medicines)
           ├──► [ LabTest ] (id, testCode, testName, category, status, result, cost)
           └──► [ Bill ] (id, invoiceNumber, subtotal, discount, totalAmount, status: PAID | PENDING)
```

---

## 🔌 REST API Endpoints

### Auth & System
- `POST /api/auth/login` - Authenticate user credentials & issue JWT token.
- `GET /api/auth/me` - Fetch authenticated session & permissions.

### Clinical & Administrative
- `GET /api/patients` - List all EMR patients (Searchable & Filterable).
- `POST /api/patients` - Register new patient.
- `GET /api/patients/:id` - Detailed EMR profile (includes prescriptions, lab tests, bills).
- `GET /api/doctors` - Directory of specialists & departments.
- `GET /api/appointments` - Consultation queue.
- `POST /api/appointments` - Book appointment slot.
- `GET /api/beds` - Visual ward grid status.
- `PATCH /api/beds/:id/status` - Allocate/Discharge bed.
- `GET /api/pharmacy` & `GET /api/lab-tests` - Diagnostics & prescription streams.
- `GET /api/billing` & `POST /api/billing` - Financial ledger & invoice generator.
- `GET /api/analytics` - Aggregated executive metrics & charts data.

---

## 🚀 Quick Setup & Local Execution

### 1. Backend API Server
```bash
cd backend
npm install
npm run seed     # Populate database with initial clinical demo data
npm run dev      # Server starts on http://localhost:5000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev      # React Vite app starts on http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@hospital.com` | `admin123` |
| **Doctor** | `doctor@hospital.com` | `doctor123` |
| **Receptionist** | `reception@hospital.com` | `reception123` |
