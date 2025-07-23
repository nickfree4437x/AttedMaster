const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { CustomError } = require('../utils/errors');

exports.registerUser = async (firstname, lastname, email, userid, password) => {
  // Validate required fields
  if (!firstname || !lastname || !email || !userid || !password) {
    throw new CustomError('All fields are required', 400);
  }

  // Check existing user
  const [existingUser, existingEmail] = await Promise.all([
    User.findOne({ userid }),
    User.findOne({ email })
  ]);

  if (existingUser) throw new CustomError('User ID already exists! Try another one.', 400);
  if (existingEmail) throw new CustomError('Email already registered!', 400);

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = new User({
    firstname,
    lastname,
    email,
    userid,
    password: hashedPassword,
  });

  await newUser.save();

  // Generate token
  const token = generateToken(newUser);

  return {
    message: 'User registered successfully!',
    token,
    user: {
      id: newUser._id,
      userid: newUser.userid,
      email: newUser.email
    }
  };
};

exports.authenticateUser = async (userid, password) => {
  if (!userid || !password) {
    throw new CustomError('User ID and Password are required', 400);
  }

  const user = await User.findOne({ userid });
  if (!user) throw new CustomError('User not found', 404);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new CustomError('Invalid credentials', 401);

  const token = generateToken(user);

  return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      userid: user.userid,
      email: user.email
    }
  };
};

// Helper function
function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id,
      userid: user.userid, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}