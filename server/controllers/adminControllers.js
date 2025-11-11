const User = require ('../models/User')
const bcrypt = require ('bcryptjs')
const Profile = require('../models/Profile')

//user management
exports.createUser = async (req,res) => {
    try {
        const {username, email, password, role} = req.body
        if(!username || !email || !password){
            return res.status(400).json({
                message: 'There are missing fields!'
            })
        }
        const createdUser = await User.create({username,email,password,role})
        const backToClient = {
            id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            role:createdUser.role
        }
        res.status(201).json({
            message: 'User created!',
            user: backToClient
        })
        
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

exports.getAllUsers = async(req,res)=>{
    try{
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({users})
    }catch(error){
        res.status(500).json({
            error:error.message
        })
    }
}

exports.getUser = async(req,res)=>{
   try {
     const user = await User.findById(req.params.id).select('-password')
    if(!user){
        return res.status(404).json({
            message:'User does not exist, check again!'
        })
    }
    res.status(200).json({
        message: `${user.username} found, here is the profile`,
        foundUser: user
    })
   } catch (error) {
    res.status(500).json({
        error: error.message
    })
   }
}

exports.updateUser = async (req,res) => {
    try {
        const updates = {...req.body}
        delete updates._id

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            {new:true, runValidators:true}
        ).select('-password')

        if(!user){
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        res.status(200).json({user})

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

exports.deleteUser = async (req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).json({
                message: 'User not found!'

            })
        }

        // Also delete the user's profile if it exists
        await Profile.findOneAndDelete({ user: req.params.id });

        res.status(200).json({
            message: 'User has been deleted',
            status:`${user.username} has been deleted `
            
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

exports.getAllUserProfiles = async (req, res) => {
    try {
        // Find all profiles and populate their associated user data
        const profiles = await Profile.find()
            .populate({ path: 'user', select: '-password' }) // Populate user, exclude password
            .sort({ createdAt: -1 });

        // Send back the array of profiles
        res.status(200).json({ profiles });
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}
        


exports.getProfileById = async (req, res) => {
    try {
        const userProfile = await Profile.findOne({ user: req.params.id });
        if (!userProfile) {
            return res.status(404).json({
                message: 'Profile not found for this user!'
            });
        }
        res.status(200).json({
            message: `Profile found!`,
            profile: userProfile
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateProfileById = async (req, res) => {
    try {
        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                message: 'Profile not found for this user!'
            });
        }
        res.status(200).json({
            message: 'Profile has been updated successfully',
            profile: updatedProfile
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.deleteProfileById = async (req, res) => {
    try {
        const deletedProfile = await Profile.findOneAndDelete({ user: req.params.id });

        if (!deletedProfile) {
            return res.status(404).json({ message: 'Profile not found for this user' });
        }

        // Also remove the profile reference from the User document
        await User.findByIdAndUpdate(req.params.id, { $unset: { profile: "" } });

        res.status(200).json({ message: 'Profile has been deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
