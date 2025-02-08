// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// Signup controller: receives user details, hashes the password, and creates a new user.
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate all required fields are present.
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if a user with this email already exists.
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Encrypt the password using bcrypt.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user.
    await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Login controller: verifies user credentials and returns a JWT if valid.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate that both email and password are provided.
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    // Find the user by email.
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare the provided password with the stored hashed password.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'User not authorized.' });
    }

    // Create a JWT containing the user's id.
    const payload = { id: user.id };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Send the token back to the frontend.
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
