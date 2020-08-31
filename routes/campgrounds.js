const express = require("express"),
      router = express.Router(),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      User = require("../models/user"),
      middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/",(req,res)=>{
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search),'gi');
        Campground.find({$or : [
            {name : regex},
            {"author.username" : regex}
        ]},function(err,foundCamps){
            if(err){
                console.log(err);
            }
            else{
                if(foundCamps.length < 1){
                    req.flash('error',"No campgrounds were found for that search");
                    res.redirect("/campgrounds")
                }
                res.render("campgrounds/index",{campgrounds : foundCamps , search : true});
            }
        })
    }else{
        Campground.find({},(err,camps)=>{
            if(err){
                console.log(err);
            }else{
                res.render("campgrounds/index",{campgrounds : camps , search : false})
            }
        })
    }
})
//CREATE - add another campground to the DB
router.post("/",middleware.isLoggedIn,(req,res)=>{
    Campground.create(req.body.camp,function(err,camp){
            if(err){
                req.flash("error","Something went wrong...")
                console.log(err);
                res.redirect("/campgrounds")
            }else{
                camp.author = {
                    id : req.user._id,
                    username : req.user.username
                };
                camp.save();
                res.redirect("/campgrounds");
            }
        })
});

//NEW - go to the FORM to create a new campground
router.get("/new",middleware.isLoggedIn,(req,res)=>{
    res.render("campgrounds/new");
})

//SHOW - shows more info about specific campground
router.get("/:id",(req,res)=>{
    // added feature of populate to refrence comments
    Campground.findById(req.params.id).populate("comments likes").exec(function (err,foundCamp){
        if(err || !foundCamp){
            req.flash("error","Something went wrong...")
            res.redirect("/campgrounds")
        }else{
            res.render("campgrounds/show",{camp : foundCamp});
        }
    });
});

//EDIT - edit campground form
router.get("/:id/edit",middleware.checkCampOwnership,(req,res)=>{
    let id = req.params.id;
    Campground.findById(id,(err,foundCamp)=>{
            res.render("campgrounds/edit",{camp : foundCamp});
    })
})
//UPDATE - update campground info
router.put("/:id",middleware.checkCampOwnership,(req,res)=>{
    let id = req.params.id;
    Campground.findById(id,(err,foundCamp)=>{
        if(err){
            console.log(err);
            res.redirect("/campgrounds/");
        }else{
            foundCamp.name = req.body.camp.name;
            foundCamp.image = req.body.camp.image;
            foundCamp.price = req.body.camp.price;
            foundCamp.description = req.body.camp.description;
            foundCamp.save((err)=>{
                if(err){
                    console.log(err);
                    return res.redirect("/campgrounds");
                }else{
                    res.redirect("/campgrounds/" + foundCamp._id);
                }
            })
        }
    }) 
})

//DESTROY - delete a campground
router.delete("/:id",middleware.checkCampOwnership,(req, res) =>{
    Campground.findByIdAndRemove(req.params.id,(err, removedCamp)=>{
        if (err) {
            console.log(err);
            res.redirect("/campgrounds")
        }
        Comment.deleteMany( {_id: { $in: removedCamp.comments } }, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
    })
});

//LIKE/UNLIKE ROUTE
router.post("/:id/like",middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id , (err,foundCamp)=>{
        if(err){
            console.log(err);
            return res.redirect("/campgrounds");
        }
        //check if this user has liked the camp before via campground collection
        var foundUserLike = foundCamp.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        if(foundUserLike){
            //remove like from camp list
            foundCamp.likes.pull(req.user._id);
            //remove like from user list
            User.findById(req.user._id,(err,foundUser)=>{
                if(err){
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                foundUser.liked.pull(foundCamp._id);
                foundUser.save((err)=>{if(err){console.log(err); return res.redirect("/campgroudns")}});
            });
        }else{
            //add like to camp list
            foundCamp.likes.push(req.user._id);
            User.findById(req.user._id,(err,foundUser)=>{
                if(err){
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                foundUser.liked.push(foundCamp._id);
                foundUser.save((err)=>{if(err){console.log(err); return res.redirect("/campgroudns")}});
            });
        }
        foundCamp.save((err)=>{if(err){console.log(err); return res.redirect("/campgroudns")}});
        return res.redirect("/campgrounds/"+foundCamp._id);
    })
})

//HELPER FUNCTIONS
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
};

module.exports = router;