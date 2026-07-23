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

# Next.js

A modern Next.js 15 application built with TypeScript and Tailwind CSS.

## 🚀 Features

- **Next.js 15** - Latest version with improved performance and features
- **React 19** - Latest React version with enhanced capabilities
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## 🛠️ Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:4028](http://localhost:4028) with your browser to see the result.

## 📁 Project Structure

```
nextjs/
├── public/             # Static assets
├── src/
│   ├── app/            # App router components
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main page component
│   ├── components/     # Reusable UI components
│   ├── styles/         # Global styles and Tailwind configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
└── tailwind.config.js  # Tailwind CSS configuration

```

## 🧩 Page Editing

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Styling

This project uses Tailwind CSS for styling with the following features:

- Utility-first approach for rapid development
- Custom theme configuration
- Responsive design utilities
- PostCSS and Autoprefixer integration

## 📦 Available Scripts

- `npm run dev` - Start development server on port 4028
- `npm run build` - Build the application for production
- `npm run start` - Start the development server
- `npm run serve` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## 📱 Deployment

Build the application for production:
npm run build

## Supabase setup

1. Create a Supabase project.
2. Add your project URL and anon key to the environment file.
3. Run the SQL in Database/supabase_schema.sql in the Supabase SQL editor.
4. Open /auth/login to sign in to the owner dashboard.

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
