const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true
    },
    firstName:{
        type: String,
        required:true,
        trim:true
    },
    surname:{
        type:String,
        required:true,
        trim:true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
     dateOfBirth:{
        type:String,
        required:true
    },
    idNumber:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    nationality:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    nationality:{
        type:String,
        required:true
    },
    languages:{
        type:String,
        required:true
    },

    department:{
        type:String,
        enum:['Inbound','Outbound','Human Resources','Information Systems','CX Admin','Finance', 'Liquid','Projects','Business Development','Eco Cash', 'Business Intelligence','Facilities','Tsebo'],
        other:'String'
    },
    jobTitle:{
        type:String,
        required:true
    },
    professionalSummary:{
        type:String,
        maxlength:3000,
        default:''
    },
    phoneNumber:{
        type:String,
        default:''
    },
    
    //education

    education:[{
        highestLevel:{
            type:String,
            enum: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'],
            default:''
        },
        degreeType:{
            type:String,
            default:''
        },
        fieldOfStudy: {
             type: String,
             enum: [
        // Natural Sciences
        'Physics',
        'Chemistry',
        'Biology',
        'Astronomy',
        'Earth Science',
        'Environmental Science',
        'Oceanography',
        'Meteorology',

        // Formal Sciences
        'Mathematics',
        'Computer Science',
        'Statistics',
        'Logic',
        'Data Science',
        'Artificial Intelligence',
        'Cybersecurity',
        'Information Systems',

        // Engineering & Technology
        'Mechanical Engineering',
        'Electrical Engineering',
        'Civil Engineering',
        'Chemical Engineering',
        'Software Engineering',
        'Aerospace Engineering',
        'Biomedical Engineering',
        'Robotics',
        'Nanotechnology',

        // Social Sciences
        'Psychology',
        'Sociology',
        'Anthropology',
        'Political Science',
        'Economics',
        'Human Geography',
        'Archaeology',
        'Criminology',
        'International Relations',

        // Humanities
        'History',
        'Philosophy',
        'Literature',
        'Linguistics',
        'Religious Studies',
        'Art History',
        'Classics',
        'Cultural Studies',

        // Arts
        'Visual Arts',
        'Music',
        'Theater',
        'Dance',
        'Film Studies',
        'Design',
        'Photography',
        'Architecture',

        // Health & Medical Sciences
        'Medicine',
        'Nursing',
        'Dentistry',
        'Pharmacy',
        'Public Health',
        'Veterinary Medicine',
        'Nutrition',
        'Kinesiology',
        'Physiotherapy',

        // Business & Management
        'Business Administration',
        'Finance',
        'Accounting',
        'Marketing',
        'Human Resource Management',
        'Entrepreneurship',
        'Supply Chain Management',
        'International Business',

        // Law & Legal Studies
        'Law',
        'Criminal Justice',
        'Legal Studies',
        'International Law',
        'Constitutional Law',
        'Environmental Law',

        // Education
        'Curriculum & Instruction',
        'Educational Leadership',
        'Special Education',
        'Early Childhood Education',
        'Educational Psychology',
        'Adult Education',

        // Agriculture & Environment
        'Agriculture',
        'Forestry',
        'Horticulture',
        'Agribusiness',
        'Sustainable Development'
             ]
        },
        university:{
            type:String,
            required:true,
            default:''
        },
        graduationYear:{
            type:Number,
            required:true
        }

    }],

    //skills

    skills: [String],
    intrestsAndVocations:[String],

    experience: [{
        title:{
            type:String
        },
        company:{
            type:String
        },
        location:{
            type:String
        },
        from:{
            type:String
        },
        current:{
            type:Boolean,
            default:false
        },
        description:{
            type:String
        }
    }],

    //socials and all that other stuff
    profilePicture :{
        type: String,
        default:''
    },
    certifications: [String],
    githubProfiles:{
        type:String,
        default:''
    },
    linkedinProfiles:{
        type: String,
        default:''
    },
    website:{
        type:String,
        default:''
    }

})

const Profile = mongoose.model('Profile',ProfileSchema)

module.exports = Profile