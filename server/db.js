const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'crm.db');

// Ensure database directory exists if custom path
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT,
      website TEXT,
      phone TEXT,
      address TEXT,
      annual_revenue REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      title TEXT,
      status TEXT DEFAULT 'Lead',
      tags TEXT DEFAULT '',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL DEFAULT 0,
      stage TEXT DEFAULT 'lead',
      probability INTEGER DEFAULT 20,
      expected_close_date TEXT,
      contact_id INTEGER,
      company_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT DEFAULT 'Task',
      subject TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      due_time TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Pending',
      contact_id INTEGER,
      deal_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      contact_id INTEGER,
      deal_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
    CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
    CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
    CREATE INDEX IF NOT EXISTS idx_activities_due ON activities(due_date);
    CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
  `);
}

function seedSampleData() {
  const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
  if (companyCount > 0) return; // Already seeded

  console.log('Seeding initial sample data for CRM...');

  const insertCompany = db.prepare(`
    INSERT INTO companies (name, industry, website, phone, address, annual_revenue)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const c1 = insertCompany.run('Acme Corp', 'Technology', 'https://acme.example.com', '+1 (555) 234-5678', '123 Tech Blvd, San Francisco, CA', 4500000);
  const c2 = insertCompany.run('Apex Global', 'Finance & Banking', 'https://apexglobal.example.com', '+1 (555) 876-5432', '45 Wall St, New York, NY', 12000000);
  const c3 = insertCompany.run('HealthPulse Systems', 'Healthcare', 'https://healthpulse.example.com', '+1 (555) 345-6789', '890 Bio Way, Boston, MA', 3200000);
  const c4 = insertCompany.run('GreenLeaf Logistics', 'Transportation', 'https://greenleaf.example.com', '+1 (555) 901-2345', '77 Freight Rd, Chicago, IL', 6800000);

  const insertContact = db.prepare(`
    INSERT INTO contacts (company_id, first_name, last_name, email, phone, title, status, tags, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const con1 = insertContact.run(c1.lastInsertRowid, 'Sarah', 'Jenkins', 'sarah.j@acme.example.com', '+1 555-101-2001', 'Chief Technology Officer', 'Customer', 'Enterprise, VIP, Decision Maker', 'Key contact for the annual cloud platform renewal.');
  const con2 = insertContact.run(c1.lastInsertRowid, 'David', 'Miller', 'david.m@acme.example.com', '+1 555-101-2002', 'Procurement Director', 'Customer', 'Procurement', 'Prefers quarterly invoicing.');
  const con3 = insertContact.run(c2.lastInsertRowid, 'Elena', 'Rostova', 'elena.r@apexglobal.example.com', '+1 555-202-3001', 'VP of Operations', 'Prospect', 'Finance, High-Value', 'Met at FinTech Summit 2026. Interested in analytics pipeline.');
  const con4 = insertContact.run(c3.lastInsertRowid, 'Marcus', 'Chen', 'marcus.c@healthpulse.example.com', '+1 555-303-4001', 'Director of IT', 'Lead', 'Healthcare, Compliance', 'Needs HIPAA-compliant integration audit before proceeding.');
  const con5 = insertContact.run(c4.lastInsertRowid, 'Olivia', 'Taylor', 'olivia.t@greenleaf.example.com', '+1 555-404-5001', 'Head of Fleet Ops', 'Prospect', 'Logistics, IoT', 'Requesting demo of real-time telemetry dashboards.');
  const con6 = insertContact.run(null, 'Alex', 'Rivera', 'alex.rivera@freelance-advisor.com', '+1 555-505-6001', 'Independent Consultant', 'Partner', 'Advisor, Referral', 'Referred 3 enterprise leads this quarter.');

  const insertDeal = db.prepare(`
    INSERT INTO deals (title, amount, stage, probability, expected_close_date, contact_id, company_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const formatDate = (daysAhead) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const d1 = insertDeal.run('Enterprise Cloud Migration Suite', 85000, 'won', 100, formatDate(-5), con1.lastInsertRowid, c1.lastInsertRowid);
  const d2 = insertDeal.run('Financial Analytics Dashboard Tier 1', 120000, 'negotiation', 80, formatDate(14), con3.lastInsertRowid, c2.lastInsertRowid);
  const d3 = insertDeal.run('HIPAA Telehealth Data Engine', 45000, 'proposal', 60, formatDate(21), con4.lastInsertRowid, c3.lastInsertRowid);
  const d4 = insertDeal.run('Fleet Tracking Telemetry Pro', 32000, 'qualified', 40, formatDate(30), con5.lastInsertRowid, c4.lastInsertRowid);
  const d5 = insertDeal.run('Acme Expansion Add-on Licenses', 18500, 'lead', 20, formatDate(45), con2.lastInsertRowid, c1.lastInsertRowid);

  const insertActivity = db.prepare(`
    INSERT INTO activities (type, subject, description, due_date, due_time, priority, status, contact_id, deal_id, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertActivity.run('Meeting', 'Review Contract Clauses with Elena', 'Discuss indemnity terms and SLA discount tier.', formatDate(1), '14:00', 'High', 'Pending', con3.lastInsertRowid, d2.lastInsertRowid, null);
  insertActivity.run('Call', 'Follow-up with Marcus on Security Checklist', 'Confirm receipt of SOC2 Type II report.', formatDate(2), '11:00', 'Medium', 'Pending', con4.lastInsertRowid, d3.lastInsertRowid, null);
  insertActivity.run('Task', 'Prepare Telemetry Demo Deck for Olivia', 'Include screenshots of battery health & driver alerts.', formatDate(3), '17:00', 'High', 'Pending', con5.lastInsertRowid, d4.lastInsertRowid, null);
  insertActivity.run('Email', 'Send Onboarding Welcome Packet', 'Welcome Sarah and send training calendar invite.', formatDate(-3), '09:30', 'Low', 'Completed', con1.lastInsertRowid, d1.lastInsertRowid, formatDate(-3));
  insertActivity.run('Call', 'Quarterly Catch-up with Alex', 'Discuss new referral incentives for Q4.', formatDate(-1), '16:00', 'Low', 'Completed', con6.lastInsertRowid, null, formatDate(-1));

  const insertNote = db.prepare(`
    INSERT INTO notes (content, contact_id, deal_id)
    VALUES (?, ?, ?)
  `);

  insertNote.run('Customer verified they will commit for 2 years upfront if we guarantee 99.95% uptime.', con3.lastInsertRowid, d2.lastInsertRowid);
  insertNote.run('Great kickoff meeting! Team is very enthusiastic about the upcoming rollout.', con1.lastInsertRowid, d1.lastInsertRowid);

  console.log('Sample data seeded successfully.');
}

function resetDatabase() {
  db.exec(`
    DELETE FROM notes;
    DELETE FROM activities;
    DELETE FROM deals;
    DELETE FROM contacts;
    DELETE FROM companies;
    DELETE FROM sqlite_sequence WHERE name IN ('notes', 'activities', 'deals', 'contacts', 'companies');
  `);
  seedSampleData();
}

// Initialize tables on load
initSchema();
seedSampleData();

module.exports = {
  db,
  DB_PATH,
  resetDatabase,
};
