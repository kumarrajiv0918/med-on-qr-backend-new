const express = require('express');
const app= express();
const userController =require('../../controllers/user/userController')
const authentication = require('../../middlewares/authentication');
 
const router=express.Router();
router.post('/createUser',authentication, userController.createUser);
router.get('/getUserAll',authentication, userController.getUserAll);
router.get('/getUserById/:userId',authentication, userController.getUserById);
router.put('/updateUserById/:userId',authentication, userController.updateUser);
router.delete('/deleteUserById/:userId',authentication, userController.deleteUser);

module.exports = router;