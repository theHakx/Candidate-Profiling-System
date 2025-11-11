const Profile = require('../models/Profile')
const User = require('../models/User')

exports.createProfile = async (req,res) =>{
    try {
        const user = req.user;
        const existingProfile = await Profile.findOne({user:user._id});
        if(existingProfile){
            return res.status(400).json({
                message:'A profile for this user already exists. You can update it instead'
            })
        }

        const userId = req.user._id;
        const createdProfile = await Profile.create({
            ...req.body,
            user:userId
        })

        // Now, link this new profile back to the User document
        await User.findByIdAndUpdate(userId, { profile: createdProfile._id });
   
        res.status(201).json({
            message: `${user.firstName}'s profile has been created succesfully!`,
            profile: createdProfile
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

exports.getProfile = async (req,res) =>{
    try {
        const userId = req.user._id;
        const user = req.user;
        const userProfile = await Profile.findOne({ user: user._id }).populate('user', 'email');
        if(!userProfile){
            // If no profile, just send back the user's email to pre-fill the form.
            return res.status(200).json({ email: user.email });
        }
        res.status(200).json({
            message: `${user.username}'s profile has been found!`,
            profile: userProfile
        })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
    
}

exports.updateProfile = async (req,res)=>{
    try {
      const userId = req.user._id;

      const updatedProfile = await Profile.findOneAndUpdate(
        {user:userId},
        req.body,
        {
            new:true,
            runValidators:true
        }
      )

      if(!updatedProfile){
        return res.status(404).json({
            message:'profile could not be found or you do not have the permission'
        })
      }
      res.status(200).json({
        message: 'Profile has been updated successfully',
        profile:updatedProfile
      })
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

exports.deleteProfile = async (req,res)=>{
    try {
        const userId = req.user._id
        const deletedProfile = await Profile.findOneAndDelete({user:userId})

        if(!deletedProfile){
            return res.status(404).json({
                message: 'Profile not found or you do not have the permission to delete'
            })
        }
        res.status(200).json({
            message:'Profile has been deleted!',
            
        })

    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
    
}

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file.' });
    }

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    // Construct the URL path
    const imageUrl = `/uploads/${req.file.filename}`;

    profile.profilePicture = imageUrl;
    await profile.save();

    res.status(200).json({
      message: 'Profile picture uploaded successfully!',
      profilePicture: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Here you could add logic to delete the old file from disk if you want
    // For now, we'll just clear the database reference.

    profile.profilePicture = '';
    await profile.save();

    res.status(200).json({
      message: 'Profile picture removed successfully!',
      profilePicture: '',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
