const Admin = require('../models/Admin');
const User = require('../models/User');

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: 'admin'});
        if (!admins){
            res.status(400).json({
                status: 'failed',
                message: "there are no admins"
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'All admins fetched successfully',
            admins
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: 'failed',
            message: "Internal Server Error" + err.message
        })
    }
}


exports.getAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id).select('-password');
        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                message: 'Admin not found'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Admin fetched successfully',
            admin
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error fetching admin' + err.message
        });
    }
}


exports.blockUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'user not found'
            });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({
            status: 'success',
            isActive: false,
            message: 'user blocked successfully',
            user
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error blocking user' + err.message
        });
    }
}


exports.activateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'user not found'
            });
        }

        user.isActive = true;
        await user.save();

        res.status(200).json({
            status: 'success',
            isActive: true,
            message: 'user activated successfully',
            user
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error activating user' + err.message
        });
    }
}