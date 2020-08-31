const express = require("express"),
router = express.Router({mergeParams : true}),
Campground = require("../models/campground"),
Comment = require("../models/comment"),
middleware = require("../middleware"); //for index.js no need to specify file required


//=======================
//   COMMENTS ROUTES
//=======================

//SHOW - COMMENT FORM
router.get("/new",middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id,(err,camp)=>{
        if(err){
            req.flash("error","Something went wrong...");
            res.redirect("/campgrounds");
        }else{
            res.render("comments/new",{camp : camp});
        }
    })
});

//CREATE - NEW COMMENT
router.post("/",middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id,(err,camp)=>{
        if(err){
            req.flash("error","Campground not found");
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment,(err,comment)=>{
                if(err){
                    req.flash("error","Comment not found");
            res.redirect("/campgrounds");
                }else{
                    //associate comment w/ user
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //associate comment w/ campground
                    camp.comments.push(comment);
                    camp.save();
                    req.flash("success","New comment added!")
                    res.redirect("/campgrounds/"+camp._id);
                }
            });
        }
    })
});

//EDIT - go to edit comment form
router.get("/:commentId/edit",middleware.checkCommentOwnership,(req,res)=>{
    Campground.findById(req.params.id,(err,foundCamp)=>{
        if(err || !foundCamp){
            req.flash("error","Campground not found");
            res.redirect("/campgrounds");
        }else{
            Comment.findById(req.params.commentId,(err,foundComment)=>{
                if(err){
                    req.flash("error","Comment not found");
                    res.redirect("back");
                }else{
                    res.render("comments/edit",{camp_id : req.params.id , comment : foundComment})
                }
            })
        }
    })

});

//UPDATE - update a comment
router.put("/:commentId",middleware.checkCommentOwnership,(req,res)=>{
    Comment.findByIdAndUpdate(req.params.commentId,req.body.comment,(err,foundComment)=>{
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//DESTROY - delete a comment
router.delete("/:commentId",middleware.checkCommentOwnership,(req,res)=>{
    Comment.findByIdAndRemove(req.params.commentId,(err,removedComment)=>{
        if(err){
            console.log(err);
            res.redirect("back");
        }
        req.flash("success","Comment successfuly deleted")
        res.redirect("/campgrounds/"+req.params.id);
    })
})

module.exports = router;