const bcrypt = require('bcrypt');
const User = require('../models/UserModel');

exports.upgradeToPremium = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    // User is found and password matches, upgrade to premium
    user.isPremium = true;
    await user.save();

    // Respond to the client
    res.json({ message: "User upgraded to Premium successfully." });
  } catch (error) {
    console.error("Error upgrading user to Premium:", error);
    res.status(500).json({ message: "An error occurred.", error: error.message });
  }
};
