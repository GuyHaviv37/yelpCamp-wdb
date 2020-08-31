var mongoose = require("mongoose");
var Campground = require("./models/campground");
var User = require("./models/user");
var Comment   = require("./models/comment");

var seeds = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        price : "7.00",
        author : {
            id : mongoose.Types.ObjectId("5eb6f30fb1ddb5436057ef25"),
            username : "admin",
            email : "guyhaviv37@walla.com"

        }
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        price : "11.00",
        author : {
            id : mongoose.Types.ObjectId("5eb6f30fb1ddb5436057ef25"),
            username : "admin",
            email : "guyhaviv37@walla.com"

        }
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        price : "9.00",
        author : {
            id : mongoose.Types.ObjectId("5eb6f30fb1ddb5436057ef25"),
            username : "admin",
            email : "guyhaviv37@walla.com"

        }
    }
]

async function seedDB(){
    try{
        await Campground.deleteMany({});
        console.log("Campgrounds removed");
        await Comment.deleteMany({});
        console.log("Comments removed");
        for(seed of seeds){
            let campground = await Campground.create(seed);
            console.log("Campground created");
            let comment = await Comment.create(
                {
                    text: "This place is great, but I wish there was internet",
                    author : {
                        id : mongoose.Types.ObjectId("5eb6f30fb1ddb5436057ef25"),
                        username : "admin" ,
                        email : "guyhaviv37@walla.com"
                    }
                }
            );
            console.log("Comment created");
            campground.comments.push(comment);
            campground.save();
            console.log("Comment added to the campground");
        };
    }
    catch(err){
        console.log(err);
    }
} 
    
module.exports = seedDB;
