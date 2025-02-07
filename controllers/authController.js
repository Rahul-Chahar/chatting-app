// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
      // Destructure email and password from the request body.
      const { email, password } = req.body;
  
      // Ensure both email and password are provided.
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
      }
  
      // Check if a user with the given email exists in the database.
      const user = await User.findOne({ email });
      if (!user) {
        // Return 404 if user is not found.
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Compare the provided password with the hashed password stored in the DB.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // If the password does not match, send a 401 Unauthorized response.
        return res.status(401).json({ message: 'User not authorized.' });
      }
  
      // If credentials match, create a JWT.
      // The payload contains the user ID. The ID is "encrypted" (signed) using the secret key.
      const payload = { id: user._id };
      // Use an environment variable for the secret key, or default to 'your-secret-key'
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '1h', // Token expiration (adjust as needed)
      });
  
      // Return the JWT to the frontend.
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Server error.' });
    }
  };