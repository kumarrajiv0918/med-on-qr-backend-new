const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/auth/registerController');
const updateUserController = require('../../controllers/auth/updateUserController');
const authentication = require('../../middlewares/authentication');

router.post('/register', registerController.register);
router.put('/updateUser/:id', authentication, updateUserController.updateUser);
module.exports = router;
