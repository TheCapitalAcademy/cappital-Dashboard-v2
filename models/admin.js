const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema=new Schema({
    password:{
        type:String
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin'
    }
});

adminSchema.plugin(passportLocalMongoose);

const Admin=mongoose.model('Admin',adminSchema);
module.exports=Admin;