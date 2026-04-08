import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("sereia.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    photo TEXT,
    services TEXT -- JSON array of service IDs
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    duration INTEGER,
    price REAL
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER,
    professionalId INTEGER,
    serviceId INTEGER,
    date TEXT, -- YYYY-MM-DD
    time TEXT, -- HH:mm
    FOREIGN KEY(clientId) REFERENCES clients(id),
    FOREIGN KEY(professionalId) REFERENCES professionals(id),
    FOREIGN KEY(serviceId) REFERENCES services(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "admin123");
}

const serviceCount = db.prepare("SELECT COUNT(*) as count FROM services").get() as { count: number };
if (serviceCount.count === 0) {
  const initialServices = [
    { name: "Corte", duration: 60, price: 80 },
    { name: "Tintura", duration: 120, price: 150 },
    { name: "Progressiva", duration: 180, price: 300 },
    { name: "Selagem", duration: 150, price: 250 },
    { name: "Escova", duration: 45, price: 60 },
    { name: "Hidratação", duration: 60, price: 100 },
  ];
  const insertService = db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)");
  initialServices.forEach(s => insertService.run(s.name, s.duration, s.price));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();
    
    console.log(`Login attempt for: "${username}" (length: ${username?.length})`);
    
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    
    if (user) {
      console.log(`Login successful for: ${username}`);
      res.json({ success: true, user: { id: (user as any).id, username: (user as any).username } });
    } else {
      console.log(`Login failed for: ${username}. Password provided length: ${password?.length}`);
      res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }
  });

  // Professionals
  app.get("/api/professionals", (req, res) => {
    const rows = db.prepare("SELECT * FROM professionals").all();
    res.json(rows.map((r: any) => ({ ...r, services: JSON.parse(r.services || "[]") })));
  });

  app.post("/api/professionals", (req, res) => {
    const { name, photo, services } = req.body;
    const result = db.prepare("INSERT INTO professionals (name, photo, services) VALUES (?, ?, ?)").run(name, photo, JSON.stringify(services));
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/professionals/:id", (req, res) => {
    const { name, photo, services } = req.body;
    db.prepare("UPDATE professionals SET name = ?, photo = ?, services = ? WHERE id = ?").run(name, photo, JSON.stringify(services), req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/professionals/:id", (req, res) => {
    db.prepare("DELETE FROM professionals WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Services
  app.get("/api/services", (req, res) => {
    res.json(db.prepare("SELECT * FROM services").all());
  });

  app.post("/api/services", (req, res) => {
    const { name, duration, price } = req.body;
    const result = db.prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)").run(name, duration, price);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/services/:id", (req, res) => {
    const { name, duration, price } = req.body;
    db.prepare("UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ?").run(name, duration, price, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/services/:id", (req, res) => {
    db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Clients
  app.get("/api/clients", (req, res) => {
    res.json(db.prepare("SELECT * FROM clients").all());
  });

  app.post("/api/clients", (req, res) => {
    const { name, phone, notes } = req.body;
    const result = db.prepare("INSERT INTO clients (name, phone, notes) VALUES (?, ?, ?)").run(name, phone, notes);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/clients/:id", (req, res) => {
    const { name, phone, notes } = req.body;
    db.prepare("UPDATE clients SET name = ?, phone = ?, notes = ? WHERE id = ?").run(name, phone, notes, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/clients/:id", (req, res) => {
    db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Appointments
  app.get("/api/appointments", (req, res) => {
    const rows = db.prepare(`
      SELECT a.*, c.name as clientName, p.name as professionalName, s.name as serviceName, s.duration as serviceDuration
      FROM appointments a
      JOIN clients c ON a.clientId = c.id
      JOIN professionals p ON a.professionalId = p.id
      JOIN services s ON a.serviceId = s.id
    `).all();
    res.json(rows);
  });

  app.post("/api/appointments", (req, res) => {
    const { clientId, professionalId, serviceId, date, time } = req.body;
    
    // Simple double booking check for the same professional at the same time
    const existing = db.prepare("SELECT * FROM appointments WHERE professionalId = ? AND date = ? AND time = ?").get(professionalId, date, time);
    if (existing) {
      return res.status(400).json({ success: false, message: "Profissional já possui agendamento neste horário." });
    }

    const result = db.prepare("INSERT INTO appointments (clientId, professionalId, serviceId, date, time) VALUES (?, ?, ?, ?, ?)").run(clientId, professionalId, serviceId, date, time);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/appointments/:id", (req, res) => {
    db.prepare("DELETE FROM appointments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const appointmentsToday = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date = ?").get(today) as any;
    const totalProfessionals = db.prepare("SELECT COUNT(*) as count FROM professionals").get() as any;
    const upcomingBookings = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date >= ?").get(today) as any;
    
    res.json({
      appointmentsToday: appointmentsToday.count,
      totalProfessionals: totalProfessionals.count,
      upcomingBookings: upcomingBookings.count
    });
  });

  // Public Booking
  app.post("/api/public/book", (req, res) => {
    const { clientName, clientPhone, professionalId, serviceId, date, time } = req.body;

    if (!clientName || !clientPhone || !professionalId || !serviceId || !date || !time) {
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    // Check availability
    const existing = db.prepare("SELECT * FROM appointments WHERE professionalId = ? AND date = ? AND time = ?").get(professionalId, date, time);
    if (existing) {
      return res.status(400).json({ success: false, message: "Este horário já foi preenchido. Por favor, escolha outro." });
    }

    // Find or create client
    let client = db.prepare("SELECT * FROM clients WHERE phone = ?").get(clientPhone) as any;
    let clientId;
    if (!client) {
      const result = db.prepare("INSERT INTO clients (name, phone) VALUES (?, ?)").run(clientName, clientPhone);
      clientId = result.lastInsertRowid;
    } else {
      clientId = client.id;
    }

    // Create appointment
    db.prepare("INSERT INTO appointments (clientId, professionalId, serviceId, date, time) VALUES (?, ?, ?, ?, ?)").run(clientId, professionalId, serviceId, date, time);

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
