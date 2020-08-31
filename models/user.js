const mongoose = require("mongoose");
const localPassport = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username : {type : String , required : true , unique : true},
    password : String,
    email : {type : String , required : true , unique : true},
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    isAdmin : {type:Boolean , default:false},
    liked : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Campground"
        }
    ]
});

UserSchema.plugin(localPassport);

module.exports = mongoose.model("User",UserSchema);
