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

// Login controller: validates credentials and returns a response.
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if both email and password are provided
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      // If credentials match, respond with a success message.
      return res.status(200).json({ message: 'Successfully logged in' });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Server error.' });
    }
  };