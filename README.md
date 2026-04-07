# VSM Digital Services Platform

**A production‑ready, full‑stack web application that combines a Loan Management System with a Photography Booking System.**  
Built with Flask, PostgreSQL, and modern frontend technologies, it features role‑based access, payment integrations, fraud detection, digital signatures, and a seamless “Finance Your Event” integration.

---

## Project Overview

VSM Digital Services Platform is designed for businesses that offer both financial services (short‑term loans) and creative services (event photography). The system allows:

- **Users** to apply for loans, upload documents, sign agreements online, and repay via PayFast, Ozow, bank transfer, or debit order.
- **Users** to browse photography packages, book events (with double‑booking prevention), access private galleries, and download photos.
- **Admins** to approve/reject loans, manage packages and bookings, view analytics, and handle fraud alerts.
- **Integrated feature** – “Finance Your Event” – automatically creates a loan for a selected photography package.

The platform is modular, secure, and ready for production deployment (HTTPS, environment‑based config, error handling).

---

## Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Frontend    | HTML5, CSS3, JavaScript, Bootstrap 5, jQuery                              |
| Backend     | Python 3.10+, Flask 2.3, Flask‑Login, Flask‑SQLAlchemy, Flask‑Bcrypt      |
| Database    | PostgreSQL 14+ (with UUID, JSONB support)                                 |
| Authentication | Session‑based + JWT for API                                            |
| Payments    | PayFast, Ozow (simulated), Bank transfer simulation, Debit order logic    |
| Notifications | Email (Flask‑Mail), SMS (Twilio), WhatsApp (optional)                    |
| Documents   | PDF generation (ReportLab), secure file uploads                           |
| Security    | Password hashing, input validation, CSRF protection, rate‑limiting ready  |

---

## Core Features

### Authentication
- User registration / login
- Password hashing (bcrypt)
- Role‑based access: `user` and `admin`

### Loan Management System
- Apply for loans **R100 – R10,000** with **10% fixed interest**, **1‑month repayment**
- Upload ID, bank statement, proof of income
- **Loan calculator** & **repayment schedule generator**
- **Credit scoring system** (based on history, income proxy, fraud risk)
- **Fraud detection** – duplicate ID checks, suspicious activity logging
- **Late payment penalty** (5% of total payable)
- **Digital signature** on automatically generated PDF loan agreement
- **Admin dashboard** to approve/reject, view all applications, and analytics

### Photography Booking System
- Create / manage photography packages (price, duration, features)
- Book events with date/time selection – **prevents double bookings**
- **Private client galleries** – upload and download photos
- Admin panel to manage bookings and packages

### Integration: “Finance Your Event”
- User selects a photography package → clicks “Finance Your Event”
- System automatically creates a loan linked to that booking (amount = package price)
- Loan repayment terms apply (1 month, 10% interest)

### Payments
- **PayFast** & **Ozow** integration (sandbox ready)
- **Bank transfer simulation** (admin can mark as paid)
- **Debit order simulation** (manual or cron‑based)
- Payment status tracking (pending / completed / failed)

### Notifications
- Email notifications (loan status, booking confirmation, payment receipts)
- SMS via Twilio (optional)
- WhatsApp notifications (optional – template ready)

### Author & Contact

- Thabang Dikotope
- Freelance Software Engineer | Full‑Stack Developer
- Helping Businesses Build Secure & Scalable Web Applications

- Email: Thabangdikotope624@gmail.com
- LinkedIn: linkedin.com/in/drey780822
- GitHub: github.com/Drey780822
- Phone: 071 891 2820