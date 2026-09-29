const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, DB_PATH, resetDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. DASHBOARD & SYSTEM STATS
// ==========================================
app.get('/api/stats', (req, res) => {
  try {
    const totalContacts = db.prepare('SELECT COUNT(*) as c FROM contacts').get().c;
    const totalCompanies = db.prepare('SELECT COUNT(*) as c FROM companies').get().c;
    const totalDeals = db.prepare('SELECT COUNT(*) as c FROM deals').get().c;
    const activeDeals = db.prepare("SELECT COUNT(*) as c FROM deals WHERE stage NOT IN ('won', 'lost')").get().c;
    const wonDeals = db.prepare("SELECT COUNT(*) as c FROM deals WHERE stage = 'won'").get().c;
    const lostDeals = db.prepare("SELECT COUNT(*) as c FROM deals WHERE stage = 'lost'").get().c;

    const pipelineValue = db.prepare("SELECT COALESCE(SUM(amount), 0) as v FROM deals WHERE stage NOT IN ('won', 'lost')").get().v;
    const wonRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as v FROM deals WHERE stage = 'won'").get().v;

    const winRate = totalDeals > 0 && (wonDeals + lostDeals) > 0 
      ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) 
      : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const pendingActivities = db.prepare("SELECT COUNT(*) as c FROM activities WHERE status = 'Pending'").get().c;
    const overdueActivities = db.prepare("SELECT COUNT(*) as c FROM activities WHERE status = 'Pending' AND due_date < ?").get(todayStr).c;

    const dealsByStage = db.prepare(`
      SELECT stage, COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount
      FROM deals
      GROUP BY stage
    `).all();

    const upcomingActivities = db.prepare(`
      SELECT a.*, c.first_name, c.last_name, co.name as company_name, d.title as deal_title
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN deals d ON a.deal_id = d.id
      WHERE a.status = 'Pending'
      ORDER BY a.due_date ASC, a.due_time ASC
      LIMIT 6
    `).all();

    const recentDeals = db.prepare(`
      SELECT d.*, c.first_name, c.last_name, co.name as company_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      ORDER BY d.updated_at DESC
      LIMIT 5
    `).all();

    res.json({
      totalContacts,
      totalCompanies,
      totalDeals,
      activeDeals,
      wonDeals,
      pipelineValue,
      wonRevenue,
      winRate,
      pendingActivities,
      overdueActivities,
      dealsByStage,
      upcomingActivities,
      recentDeals,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. CONTACTS API
// ==========================================
app.get('/api/contacts', (req, res) => {
  try {
    const { search, status, company_id } = req.query;
    let query = `
      SELECT c.*, co.name as company_name,
        (SELECT COUNT(*) FROM deals WHERE contact_id = c.id) as deals_count,
        (SELECT COUNT(*) FROM activities WHERE contact_id = c.id AND status = 'Pending') as pending_activities_count
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR co.name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }
    if (status && status !== 'all') {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (company_id) {
      query += ` AND c.company_id = ?`;
      params.push(company_id);
    }

    query += ` ORDER BY c.updated_at DESC`;
    const contacts = db.prepare(query).all(...params);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contacts/:id', (req, res) => {
  try {
    const contact = db.prepare(`
      SELECT c.*, co.name as company_name
      FROM contacts c
      LEFT JOIN companies co ON c.company_id = co.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const deals = db.prepare('SELECT * FROM deals WHERE contact_id = ? ORDER BY created_at DESC').all(req.params.id);
    const activities = db.prepare('SELECT * FROM activities WHERE contact_id = ? ORDER BY due_date DESC').all(req.params.id);
    const notes = db.prepare('SELECT * FROM notes WHERE contact_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ ...contact, deals, activities, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', (req, res) => {
  try {
    const { company_id, first_name, last_name, email, phone, title, status, tags, notes } = req.body;
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO contacts (company_id, first_name, last_name, email, phone, title, status, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(company_id || null, first_name, last_name, email || '', phone || '', title || '', status || 'Lead', tags || '', notes || '');
    const newContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contacts/:id', (req, res) => {
  try {
    const { company_id, first_name, last_name, email, phone, title, status, tags, notes } = req.body;
    const stmt = db.prepare(`
      UPDATE contacts
      SET company_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, title = ?, status = ?, tags = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(company_id || null, first_name, last_name, email || '', phone || '', title || '', status || 'Lead', tags || '', notes || '', req.params.id);
    const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. COMPANIES API
// ==========================================
app.get('/api/companies', (req, res) => {
  try {
    const companies = db.prepare(`
      SELECT co.*, 
        COUNT(DISTINCT c.id) as contacts_count,
        COUNT(DISTINCT d.id) as deals_count,
        COALESCE(SUM(d.amount), 0) as total_deal_value
      FROM companies co
      LEFT JOIN contacts c ON c.company_id = co.id
      LEFT JOIN deals d ON d.company_id = co.id
      GROUP BY co.id
      ORDER BY co.name ASC
    `).all();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', (req, res) => {
  try {
    const { name, industry, website, phone, address, annual_revenue } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required' });

    const stmt = db.prepare(`
      INSERT INTO companies (name, industry, website, phone, address, annual_revenue)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, industry || '', website || '', phone || '', address || '', Number(annual_revenue) || 0);
    const newCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/companies/:id', (req, res) => {
  try {
    const { name, industry, website, phone, address, annual_revenue } = req.body;
    db.prepare(`
      UPDATE companies
      SET name = ?, industry = ?, website = ?, phone = ?, address = ?, annual_revenue = ?
      WHERE id = ?
    `).run(name, industry || '', website || '', phone || '', address || '', Number(annual_revenue) || 0, req.params.id);
    const updated = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/companies/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. DEALS & PIPELINE API
// ==========================================
app.get('/api/deals', (req, res) => {
  try {
    const deals = db.prepare(`
      SELECT d.*, 
        c.first_name, c.last_name, c.email as contact_email,
        co.name as company_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      ORDER BY d.created_at DESC
    `).all();
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deals', (req, res) => {
  try {
    const { title, amount, stage, probability, expected_close_date, contact_id, company_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Deal title is required' });

    const stmt = db.prepare(`
      INSERT INTO deals (title, amount, stage, probability, expected_close_date, contact_id, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title, 
      Number(amount) || 0, 
      stage || 'lead', 
      Number(probability) || 20, 
      expected_close_date || null, 
      contact_id || null, 
      company_id || null
    );
    const newDeal = db.prepare(`
      SELECT d.*, c.first_name, c.last_name, co.name as company_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      WHERE d.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(newDeal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/deals/:id', (req, res) => {
  try {
    const { title, amount, stage, probability, expected_close_date, contact_id, company_id } = req.body;
    db.prepare(`
      UPDATE deals
      SET title = COALESCE(?, title),
          amount = COALESCE(?, amount),
          stage = COALESCE(?, stage),
          probability = COALESCE(?, probability),
          expected_close_date = COALESCE(?, expected_close_date),
          contact_id = COALESCE(?, contact_id),
          company_id = COALESCE(?, company_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, amount, stage, probability, expected_close_date, contact_id, company_id, req.params.id);

    const updated = db.prepare(`
      SELECT d.*, c.first_name, c.last_name, co.name as company_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      WHERE d.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/deals/:id/stage', (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ error: 'Stage is required' });

    let prob = 20;
    if (stage === 'lead') prob = 20;
    else if (stage === 'qualified') prob = 40;
    else if (stage === 'proposal') prob = 60;
    else if (stage === 'negotiation') prob = 80;
    else if (stage === 'won') prob = 100;
    else if (stage === 'lost') prob = 0;

    db.prepare(`
      UPDATE deals
      SET stage = ?, probability = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(stage, prob, req.params.id);

    const updated = db.prepare(`
      SELECT d.*, c.first_name, c.last_name, co.name as company_name
      FROM deals d
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN companies co ON d.company_id = co.id
      WHERE d.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/deals/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ACTIVITIES & TASKS API
// ==========================================
app.get('/api/activities', (req, res) => {
  try {
    const { status, type, contact_id, deal_id } = req.query;
    let query = `
      SELECT a.*, c.first_name, c.last_name, co.name as company_name, d.title as deal_title
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN deals d ON a.deal_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    if (type && type !== 'all') {
      query += ` AND a.type = ?`;
      params.push(type);
    }
    if (contact_id) {
      query += ` AND a.contact_id = ?`;
      params.push(contact_id);
    }
    if (deal_id) {
      query += ` AND a.deal_id = ?`;
      params.push(deal_id);
    }

    query += ` ORDER BY a.due_date ASC, a.due_time ASC`;
    const activities = db.prepare(query).all(...params);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', (req, res) => {
  try {
    const { type, subject, description, due_date, due_time, priority, contact_id, deal_id } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });

    const stmt = db.prepare(`
      INSERT INTO activities (type, subject, description, due_date, due_time, priority, status, contact_id, deal_id)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `);
    const info = stmt.run(
      type || 'Task',
      subject,
      description || '',
      due_date || new Date().toISOString().split('T')[0],
      due_time || '',
      priority || 'Medium',
      contact_id || null,
      deal_id || null
    );

    const newActivity = db.prepare(`
      SELECT a.*, c.first_name, c.last_name, co.name as company_name, d.title as deal_title
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN deals d ON a.deal_id = d.id
      WHERE a.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(newActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/activities/:id', (req, res) => {
  try {
    const { type, subject, description, due_date, due_time, priority, status, contact_id, deal_id } = req.body;
    const completed_at = status === 'Completed' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE activities
      SET type = COALESCE(?, type),
          subject = COALESCE(?, subject),
          description = COALESCE(?, description),
          due_date = COALESCE(?, due_date),
          due_time = COALESCE(?, due_time),
          priority = COALESCE(?, priority),
          status = COALESCE(?, status),
          completed_at = ?,
          contact_id = COALESCE(?, contact_id),
          deal_id = COALESCE(?, deal_id)
      WHERE id = ?
    `).run(type, subject, description, due_date, due_time, priority, status, completed_at, contact_id, deal_id, req.params.id);

    const updated = db.prepare(`
      SELECT a.*, c.first_name, c.last_name, co.name as company_name, d.title as deal_title
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN companies co ON c.company_id = co.id
      LEFT JOIN deals d ON a.deal_id = d.id
      WHERE a.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/activities/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. NOTES API
// ==========================================
app.get('/api/notes', (req, res) => {
  try {
    const { contact_id, deal_id } = req.query;
    let query = 'SELECT * FROM notes WHERE 1=1';
    const params = [];
    if (contact_id) {
      query += ' AND contact_id = ?';
      params.push(contact_id);
    }
    if (deal_id) {
      query += ' AND deal_id = ?';
      params.push(deal_id);
    }
    query += ' ORDER BY created_at DESC';
    const notes = db.prepare(query).all(...params);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const { content, contact_id, deal_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Note content is required' });

    const stmt = db.prepare('INSERT INTO notes (content, contact_id, deal_id) VALUES (?, ?, ?)');
    const info = stmt.run(content, contact_id || null, deal_id || null);
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. SYSTEM & DATABASE INFO API
// ==========================================
app.get('/api/system/info', (req, res) => {
  try {
    let sizeBytes = 0;
    if (fs.existsSync(DB_PATH)) {
      sizeBytes = fs.statSync(DB_PATH).size;
    }
    const sqliteVersion = db.prepare('SELECT sqlite_version() as v').get().v;
    const tableStats = {
      companies: db.prepare('SELECT COUNT(*) as c FROM companies').get().c,
      contacts: db.prepare('SELECT COUNT(*) as c FROM contacts').get().c,
      deals: db.prepare('SELECT COUNT(*) as c FROM deals').get().c,
      activities: db.prepare('SELECT COUNT(*) as c FROM activities').get().c,
      notes: db.prepare('SELECT COUNT(*) as c FROM notes').get().c,
    };

    res.json({
      dbPath: DB_PATH,
      sizeBytes,
      sizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
      sqliteVersion,
      tables: tableStats,
      platform: process.platform,
      nodeVersion: process.version,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/system/reset', (req, res) => {
  try {
    resetDatabase();
    res.json({ success: true, message: 'Database reset to sample data successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/system/export', (req, res) => {
  try {
    const data = {
      exportedAt: new Date().toISOString(),
      companies: db.prepare('SELECT * FROM companies').all(),
      contacts: db.prepare('SELECT * FROM contacts').all(),
      deals: db.prepare('SELECT * FROM deals').all(),
      activities: db.prepare('SELECT * FROM activities').all(),
      notes: db.prepare('SELECT * FROM notes').all(),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="crm-backup.json"');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend in production
const distPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CRM API Server running at http://localhost:${PORT}`);
  console.log(`SQLite database located at: ${DB_PATH}`);
});
