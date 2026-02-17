const mongoose=require('mongoose');

const studentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    rollNumber:{
        type:String,
        required:true,
        unique:true
    },
    grade:{
        type:String,
        required:true
    },
    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    assignedBus:{
        type:mongose.Schema.Types.ObjectId,
        ref:'Bus',
        required:true
    },
    stopLocation:{
        name:String,
        coordinates:{
            lat:Number,
            lng:Number
        }
    },
    status:{
        type:String,
        enum:['home','on-bus','at-school','absent'],
        default:'home'
    },
    medicalInfo:{
        bloodGroup:String,
        allergies:[String]
    },
}, {timestamps:true});

module.exports=mongoose.model('Student',studentSchema);