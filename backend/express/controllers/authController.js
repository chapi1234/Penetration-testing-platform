const User = require('../models/User.js');
const Admin = require('../models/Admin.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const createToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide email and password',
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide a valid email address',
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'failed',
                message: 'User does not exist',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid credentials',
            });
        }
 
        const token = createToken(user._id, user.email, user.role);

        res.status(200).json({
            status: 'success',
            message: 'User logged in successfully',
            data: {
                user,
                token,
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'failed',
            message: err.message,
        });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({
                status: 'failed',
                message: 'User already exists',
            });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please enter a valid email address',
            });
        } 
        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({
                status: 'failed',
                message: 'Password must be at least 8 characters long and include numbers, symbols, and uppercase letters',
            });
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'client'
        });

        const user = await newUser.save();
        const token = createToken(user._id, user.email, user.role);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'failed',
            message: err.message,
        });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide email and password',
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                status: 'failed',
                message: 'Please provide a valid email address',
            });
        }

        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'failed',
                message: 'Admin does not exist',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'failed',
                message: 'Invalid credentials',
            });
        }
 
        const token = createToken(user._id, user.email, user.role);

        res.status(200).json({
            status: 'success',
            message: 'Admin logged in successfully',
            data: {
                user,
                token,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'failed',
            message: 'An internal server error occurred' + err.message,
        });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ message: 'Valid email is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.tokenExpire = Date.now() + 3600000; // 1 hour
        await user.save( { validateBeforeSave: false });

        // const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${encodeURIComponent(token)}`;
        const resetUrl = `http://localhost:8080/reset-password/${encodeURIComponent(token)}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'Your App <no-reply@yourapp.com>',
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click here: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Generated Token:', token);
        console.log('User Document After Save:', user);
        res.status(200).json({ message: 'Password reset link sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const  token  = decodeURIComponent(req.params.token);
        const { password } = req.body;

        console.log('Token from request:', token);

        const user = await User.findOne({
            resetToken: token,
            tokenExpire: { $gt: Date.now() },
        });
        console.log('Query conditions:', {
            resetToken: token,
            tokenExpire: { $gt: Date.now() },
        });

        console.log('User found:', user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({ message: 'Password is too weak' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.tokenExpire = undefined;
        await user.save();
        console.log('Token from URL:', token);
        console.log('User Found in DB:', user)
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};