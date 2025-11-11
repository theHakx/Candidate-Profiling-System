const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        trim:true
    },
    surname:{
        type: String,
        trim:true
    },
    username:{
        type: String,
        required:[true,'Username is required'],
        unique: true,
        trim:true
    },
    email: {
        type: String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type: String,
        select: false,
        required:true
    },
    role: {
        type: String,
        enum:['user','admin'],
        default:'user'
    },

    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },

    resetPasswordToken:String,
    resetPasswordExpiration: Date,
    shareToken:String,
    shareTokenExpiration:Date,

})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = Math.random().toString(36).substr(2)
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpiration = Date.now() + 15 * 60 * 1000;

    return resetToken
}
   

const User = mongoose.model('User',userSchema)



module.exports = User
