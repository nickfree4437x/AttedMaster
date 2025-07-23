// controllers/profileController.js

const User = require('../models/User'); // Import the User model

// Controller to get the admin profile
const getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.userid; // Get the user ID from the decoded JWT token

    // Find the user by the user ID
    const user = await User.findOne({ userid: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user profile information (you can adjust this as needed)
    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      userid: user.userid,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

module.exports = { getAdminProfile };
