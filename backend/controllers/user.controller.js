const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const register = async (req, res) => {
  const { fullName, email, password, dob, voterId } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "All fields are required" 
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: "Email already in use" 
      });
    }

    const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const user = await User.create({
      fullName,
      email,
      password,
      profileImage,
      dob,
      voterId,
    });

    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        dob: user.dob,
        voterId: user.voterId
      },
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, dob, voterId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ 
      success: false,
      error: "User not found" 
    });

    if (fullName) user.fullName = fullName;
    if (dob) user.dob = dob;
    if (voterId) user.voterId = voterId;

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    
    res.status(200).json({ 
      success: true,
      message: "Profile updated successfully", 
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        dob: user.dob,
        voterId: user.voterId
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ 
      success: false,
      error: "User not found" 
    });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ 
      success: false,
      error: "Incorrect current password" 
    });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Password changed successfully" 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "All fields are required" 
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        error: "Wrong password" 
      });
    }

    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        dob: user.dob,
        voterId: user.voterId,
        votedFor: user.votedFor
      },
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// user details
const userDetails = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      dob: user.dob,
      voterId: user.voterId,
      votedFor: user.votedFor
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  userDetails,
  updateProfile,
  changePassword,
};
