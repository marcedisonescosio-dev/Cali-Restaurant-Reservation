const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, phone, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user (default to customer unless specifically specified as admin)
    const assignedRole = role === 'admin' ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password,
      role: assignedRole
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Validate user & password match
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser
};
