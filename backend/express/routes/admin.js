const router = require('express').Router()
const adminController = require('../controllers/adminController')

router.get('/', adminController.getAllAdmins);
router.get('/:id', adminController.getAdminById);
router.patch('/block/:id', adminController.blockUser);
router.patch('/activate/:id', adminController.activateUser);

module.exports = router