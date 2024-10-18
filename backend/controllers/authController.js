const { signup,login } = require('../services/authService');

const signupController = async (req, res) => {
  try {
    // Log incoming request body for debugging
    console.log('Request body:', req.body);

    // Validate input (optional but recommended)
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    const newUser = await signup(req.body);
   
    res.status(201).json({ message: 'Signup successful'});
  } catch (error) {
  
    console.error('Signup error:', error);

  
    res.status(400).json({ message: 'Error during signup', error: error.message });
  }
};

const loginController = async (req, res) => {
    try {
      // Log incoming request body for debugging
      // Validate input
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
  
      // Call the login service
      const user = await login(req.body);
  
      // Respond with success
      res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Error during login', error: error.message });
    }
  };


module.exports = { signupController,loginController };
