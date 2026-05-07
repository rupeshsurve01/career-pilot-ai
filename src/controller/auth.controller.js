const { default: bcrypt } = require('bcryptjs');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');


async function registerUserController(req, res) {

    try {
        const { username, email, password } = req.body
        
        if  (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });    
        }  

        const isUserAlreadyExist = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token)

        return res.status(201).json({ message: 'User registered successfully', token });


    } catch (error) {
        
    }
}

module.exports = {
    registerUserController
}
