const Comment = require("../models/comment");
const Campground = require("../models/campground");
var middlewareObj = {};

middlewareObj.checkCampOwnership = function (req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,(err,foundCamp)=>{
            if(err || !foundCamp){
                req.flash("error","Campground not found")
                res.redirect("back");
            }else{
                if(foundCamp.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that")
                    res.redirect("/campgrounds/"+req.params.id);
                }
            }
        })
    }else{
        req.flash("error","You need to log in to continue")
        res.redirect("/campgrounds/"+req.params.id);
    }
};

middlewareObj.checkCommentOwnership = function (req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentId,(err,foundComment)=>{
            if(err || !foundComment){
                req.flash("error","Something went wrong...")
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that")
                    res.redirect("back");
                }
            }
        })
    }else{
        req.flash("error","You need to log in to continue")
        res.redirect("back")
    } 
};

middlewareObj.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    req.flash("error","You need to log in to continue")
    res.redirect("/login");
}

module.exports = middlewareObj;