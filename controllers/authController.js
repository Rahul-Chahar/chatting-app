// controllers/authController.js
const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
  }
  try {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.User.create({ name, email, password: hashedPassword, phone });
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: 'Server error during signup.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid password.' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.status(200).json({ token, userId: user.id });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};
