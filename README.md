# PulseCRM - Local React & SQLite3 CRM for Windows

A simple, fast, modern, and offline-first CRM (Customer Relationship Management) web application built with **React**, **Express**, and **SQLite3** (`better-sqlite3`), running entirely locally on Windows.

---

## 🌟 Key Features

- **Local SQLite3 Storage**: All data is stored in a single local database file (`crm.db`) on your Windows drive with WAL (Write-Ahead Logging) mode enabled for high performance.
- **Sales Dashboard**: Real-time KPI summary cards (Pipeline Value, Won Revenue, Win Rate, Overdue Tasks), stage distribution breakdown, and quick action feeds.
- **Contacts Directory**: Search by name/email/company, filter by status (Lead, Prospect, Customer, Partner, Inactive), view contact timeline, associate deals, and log interaction notes.
- **Visual Deals Pipeline (Kanban Board)**: Drag/advance opportunities through 6 stages (`Lead In` → `Qualified` → `Proposal Sent` → `In Negotiation` → `Closed Won` 🎉 → `Closed Lost`) with automatic value totals per stage and celebration confetti!
- **Companies & Accounts**: Manage client organizations, track annual revenue, website, office addresses, and linked contacts/deals.
- **Tasks & Activities**: Schedule calls, meetings, emails, and follow-ups with priority flags and one-click completion.
- **Database Tools & Settings**:
  - View real-time SQLite database path, file size, and table row counts.
  - One-click JSON backup export.
  - One-click reset to sample demo data.
- **Double-Click Windows Launch**: Includes `start-crm.bat` so you can launch the CRM and open your browser with a single double-click.

---

## 🚀 Quick Start (Windows)

### Option 1: Double-Click Launcher
Double-click `start-crm.bat` in File Explorer. It will start the server and automatically open `http://localhost:5000` in your default browser.

### Option 2: Running via Terminal / PowerShell
```powershell
# Navigate to the project
cd D:\Github\react-sqlite-crm

# Start in Production mode (Single port: 5000)
npm start

# Or start in Development mode with Vite Hot-Reload (Port 3000 + API 5000)
npm run dev
```

---

## 🏗️ Architecture & Tech Stack

```
react-sqlite-crm/
├── crm.db                    # Local SQLite3 database file (created automatically)
├── server/
│   ├── db.js                 # SQLite schema, indexes, and initial demo seeder
│   └── index.js              # Express REST API & static file server
├── client/
│   ├── src/
│   │   ├── components/       # Dashboard, Contacts, Deals, Companies, Tasks, Settings
│   │   ├── api.js            # Frontend REST client wrapper
│   │   ├── App.jsx           # Main application state and layout
│   │   └── main.jsx          # React 19 entrypoint
│   └── vite.config.js        # Vite + Tailwind CSS + API Proxy
├── start-crm.bat             # Windows one-click production launcher
├── start-dev.bat             # Windows one-click development launcher
└── package.json              # Orchestrates server & client
```

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons, Canvas Confetti
- **Backend**: Node.js, Express 5, CORS
- **Database**: SQLite3 via `better-sqlite3` with foreign key constraints and indexed queries

---

## 🗄️ Database Schema

The SQLite schema automatically creates:
- `companies`: id, name, industry, website, phone, address, annual_revenue, created_at
- `contacts`: id, company_id, first_name, last_name, email, phone, title, status, tags, notes, created_at
- `deals`: id, title, amount, stage, probability, expected_close_date, contact_id, company_id, created_at
- `activities`: id, type, subject, description, due_date, due_time, priority, status, contact_id, deal_id
- `notes`: id, content, contact_id, deal_id, created_at

---

## 📦 API Endpoints

- `GET /api/stats` - Summary metrics & KPI counters
- `GET/POST/PUT/DELETE /api/contacts` - Manage contacts
- `GET/POST/PUT/DELETE /api/companies` - Manage organizations
- `GET/POST/PUT/DELETE /api/deals` - Manage pipeline deals
- `PATCH /api/deals/:id/stage` - Update deal stage
- `GET/POST/PUT/DELETE /api/activities` - Manage tasks & calls
- `GET/POST/DELETE /api/notes` - Manage notes
- `GET /api/system/info` - Inspect local SQLite storage file size & stats
- `GET /api/system/export` - Download complete database JSON backup
- `POST /api/system/reset` - Reset & re-seed demo data
