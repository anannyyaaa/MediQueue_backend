require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// ---------- AUTH MIDDLEWARE ----------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/', (req, res) => {
  res.send('Hello, MediQueue backend is alive!');
});

// ---------- LOGIN ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const admin = await prisma.admin.findUnique({ where: { email } });
    const valid = admin && await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, email: admin.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ---------- HOSPITALS ----------
// READ (public)
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany();
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch hospitals' });
  }
});

// CREATE (admin only)
app.post('/api/hospitals', requireAuth, async (req, res) => {
  try {
    const hospital = await prisma.hospital.create({ data: req.body });
    res.status(201).json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not add hospital' });
  }
});

// UPDATE (admin only)
app.put('/api/hospitals/:id', requireAuth, async (req, res) => {
  try {
    const hospital = await prisma.hospital.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update hospital' });
  }
});

// DELETE (admin only)
app.delete('/api/hospitals/:id', requireAuth, async (req, res) => {
  try {
    await prisma.hospital.delete({ where: { id: req.params.id } });
    res.json({ message: 'Hospital deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete hospital' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});