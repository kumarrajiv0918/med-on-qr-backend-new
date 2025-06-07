
const express = require('express');
const authController = require('../../controllers/auth/authController');
const statusUpdate = require('../../controllers/auth/statusUpdateController')
const router = express.Router();
const authentication = require('../../middlewares/authentication');
const changePasswordController = require('../../controllers/auth/changePassword')

router.post('/login', authController.login);
router.put('/updateUserStatus/:id', authentication, statusUpdate.updateUserStatus);
router.post('/changePassword', authentication, changePasswordController.changePassword)

module.exports = router;