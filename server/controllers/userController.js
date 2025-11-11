const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signUp = async (req,res)=>{
    try {
        const { name, surname, username, email, password } = req.body;
        const newUser = await User.create({ firstName: name, surname, username, email, password });
        res.status(201).json({
            message: 'User created successfuilly!',
            user: {
                id: newUser._id,
                name:newUser.firstName,
                surname:newUser.surname,
                username: newUser.username,
                email:newUser.email,
                
            }
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}
exports.login = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email}).select('+password firstName surname role')

        if(!user){
            return res.status(401).json({
                message:'Inavlid credentials'
            })
        }
        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({
                message:'invalid credentials'
            })
        }

        //creating the token upon successful login

        const token = jwt.sign(
            {   id: user._id, 
                username: user.username,
                role: user.role,
                name: user.firstName
            },
            process.env.jwtSecret,
            {expiresIn:'8h'}
        )

        res.status(200).json({
            message: 'login succesful!',
            token:token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                role:user.role,
                name:user.firstName,
                surname:user.surname
            },
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}
