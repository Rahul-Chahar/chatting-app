// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Signup controller: receives form data, validates, encrypts password, and stores the user.
exports.signup = async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const { name, email, phone, password } = req.body;

    // Validate that all required fields are present
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Encrypt the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user document with the hashed password
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Save the new user in the database
    await newUser.save();

    // Respond with a success message
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
