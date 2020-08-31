const mongoose = require("mongoose");
//Campground Schema SETUP
var campgroundSchema = new mongoose.Schema({
    name : String,
    image : String,
    price : String,
    description : String,
    createdAt : {type : Date , default : Date.now},
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref :"User"
        },
        username : String
    },
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ]
});

//Create a model
module.exports =  mongoose.model("Campground",campgroundSchema);