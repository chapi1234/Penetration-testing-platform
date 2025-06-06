const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const upload = require("../middlewares/multer");
const bcrypt = require("bcryptjs");
const Store = require("../models/StoreScan");
const axios = require("axios");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "client" }).select("-password");
    if (users.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No users found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" + err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching user" + err.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if a file is uploaded
    if (req.file) {
      // Upload the file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_images",
      });

      // Add the Cloudinary URL to the request body
      req.body.image = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Error updating user: " + err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID",
      });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error deleting user" + err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  const { id } = req.params; // user id from route param
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Find user by id
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password and confirm password do not match",
      });
    }

    // Optionally, check if new password is same as current password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        status: "fail",
        message: "New password must be different from current password",
      });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Error updating password: " + err.message,
    });
  }
};

async function fetchAndStoreScanResult(scan_id) {
  try {
    const response = await axios.get(
      `http://192.168.216.2:8000/api/scan/result/${scan_id}`
    );

    await Store.findOneAndUpdate(
      { scan_id },
      { response: response.data.analysis },
      { new: true }
    );
    // Optionally log success
    console.log(`Scan result for ${scan_id} stored in DB.`);
  } catch (error) {
    console.error("Error fetching/storing scan result:", error.message);
  }
}

exports.scanStatus = async (req, res) => {
  const scan_id = req.params.id;
  try {
    const response = await axios.get(
      `http://192.168.216.2:8000/api/scan/status/${scan_id}`
    );

    if (response.data.status === "completed") {
      await Store.findOneAndUpdate(
        { scan_id },
        { status: response.data.status },
        { new: true }
      );
      // Trigger result fetch/store in the background
      fetchAndStoreScanResult(scan_id);
    }

    res.status(200).json({
      status: "success",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch scan status",
      error: error.message,
    });
  }
};

// Keep your exports.result controller for manual result fetching if needed
exports.result = async (req, res) => {
  const scan_id = req.params.scan_id || req.body.scan_id;
  try {
    const response = await axios.get(
      `http://192.168.216.2:8000/api/scan/result/${scan_id}`
    );

    const result = await Store.findOneAndUpdate(
      { scan_id },
      { response: response.data.analysis },
      { new: true }
    );

    if (result) {
      res.status(200).json({
        status: "success",
        data: response.data.analysis,
      });
    } else {
      res.status(404).json({
        status: "fail",
        data: "problem in adding the data in the database",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch scan result",
      error: error.message,
    });
  }
};

function scanIdGenerator(url) {
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  const timestamp = Date.now().toString(36);

  const randomPart = Math.floor(Math.random() * 1e8).toString(36);

  const scanId = `${simpleHash(url)}-${timestamp}-${randomPart}`;
  return scanId;
}

exports.getScanResult = async (req, res) => {
  const { scan_id } = req.params;
  try {
    const scan = await Store.findOne({ scan_id });
    if (!scan) {
      return res.status(404).json({
        status: "fail",
        message: "Scan not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: scan,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching scan: " + error.message,
    });
  }
};

exports.getScansByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const scans = await Store.find({ id });
    if (!scans || scans.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No scans found for this user",
      });
    }
    res.status(200).json({
      status: "success",
      data: scans,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching scans: " + error.message,
    });
  }
};

exports.getScanHistory = async (req, res) => {
  try {
    const scans = await Store.find({});
    if (!scans || scans.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No scan history found",
      });
    }
    res.status(200).json({
      status: "success",
      data: scans,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching scan history: " + error.message,
    });
  }
};

exports.submitScan = async (req, res) => {
  try {
    const { url, type, options } = req.body;
    const userId = req.user && (req.user._id || req.user.id);
    if (!url || !type || !userId) {
      return res.status(400).json({
        status: "fail",
        message: "URL, scan type, and user authentication are required.",
      });
    }

    const scan_id =
      typeof scanIdGenerator === "function"
        ? scanIdGenerator(url)
        : Math.random().toString(36).substring(2, 10);

    const newScan = new Store({
      id: userId, // <-- set to authenticated user's id
      url,
      scan_type: type,
      scan_id,
      custom_options: type === "custom" ? JSON.stringify(options) : "",
      status: "pending",
      response: {},
    });

    await newScan.save();

    const payload = {
      url,
      scan_type: type,
      scan_id,
      callback_url: "https://your-callback-url.com/results",
      custom_options: type === "custom" ? options : undefined,
    };

    const response = await axios.post(
      "http://192.168.216.2:8000/api/scan",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res.status(201).json({
      status: "success",
      message: "Scan submitted successfully",
      scanId: scan_id,
    });
  } catch (error) {
    console.error("Error submitting scan:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to submit scan",
      error: error.message,
    });
  }
};
