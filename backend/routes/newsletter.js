// server.js or routes/newsletter.js
const express = require('express');
const router = express.Router();

// Example: in-memory array (replace with DB like MongoDB or MySQL in real apps)
const subscribers = [];

router.post('/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Check if already subscribed
  if (subscribers.includes(email)) {
    return res.status(409).json({ message: "Already subscribed" });
  }

  subscribers.push(email);
  return res.status(200).json({ message: "Successfully subscribed" });
});

module.exports = router;
