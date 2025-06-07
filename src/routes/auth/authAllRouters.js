const express = require('express');
const router = express.Router();
const {
    login, 
    forgotPassword, 
    resetPassword, 
    changePassword ,
} = require('../../controllers/auth/authAllController');
const authentication = require('../../middlewares/authentication');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', authentication, changePassword);

module.exports = router;