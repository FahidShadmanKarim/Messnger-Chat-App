const express = require('express');
const { signupController,loginController} = require('../controllers/authController'); // Corrected the import

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);

module.exports = router;