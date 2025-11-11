const Profile = require('../models/Profile')
const Bucket = require('../models/Bucket');

exports.getPublicProfile = async(req,res)=>{
    try {
        const userProfile = await Profile.findOne({user:req.params.id})
        if(!userProfile){
            return res.status(404).json({
                message:'Profile not found!'
            })
        }
        res.status(200).json({
            message:'Profile fetched successfully',
            profile:userProfile
        });
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}

exports.getPublicBucketByToken = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const bucket = await Bucket.findOne({ shareToken })
      .populate({
        path: 'profiles',
        // We need to populate the user details within each profile
        populate: {
          path: 'user',
          select: 'email', // We only need the email from the user model for the view
        },
      });

    if (!bucket) {
      return res.status(404).json({ message: 'Bucket not found or link is invalid.' });
    }

    res.status(200).json({ bucket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};