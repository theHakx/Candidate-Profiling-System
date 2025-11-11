const User = require('../models/User')
const Profile = require('../models/Profile')
const crypto = require('crypto')

const ezToken = () =>{
    return Date.now().toString(36) + Math.random().toString(36).slice(2,10)
}

exports.generateShareLink = async (req,res)=>{
    try {
        const targetId = req.params.targetId;
        if(!req.user){
            return res.status(401).json({
                message: 'Not Authenticated'
            })
        }
        const requesterId = (req.user.id || req.user.Profile._id || '').toString();
        if(req.user.role !== 'admin' && requesterId !== targetId){
            return res.status(403).json({
                message:'Forbidden: cannot create link for this user'
            })
        }

        const profile = await Profile.findOne({user:targetId})
        if(!profile){
            return res.status(404).json({message:'Profile not found for target user'})
        }

        const user = await User.findById(targetId)
        if(!user){
            return res.status(404).json({message:'User not found'})
        }
        
        const token = ezToken()
        user.shareToken = token;
        user.shareTokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000

        const frontendBase = process.env.FrontendURL || 'http://my-frontend-domain.com'
        const link = `${frontendBase}/profile/${token}`

        return res.status(200).json({link})
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
        
    }
}
