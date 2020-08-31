const express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    passport = require("passport"),
    async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto');

//LANDING PAGE
router.get("/", (req, res) => {
    res.render("landingpage");
});

//=======================
//   AUTH ROUTES
//=======================

//SIGNUP ROUTES
router.get("/register", (req, res) => {
    res.render("auth/register");
});

//SIGN UP logic
router.post("/register", (req, res) => {
    let newUser = new User({ username: req.body.username, email: req.body.email })
    User.register(newUser, req.body.password, (err, newUser) => {
        if (err) {
            console.log(err);
            req.flash('error',err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Thank you for signing up ${newUser.username}`)
            res.redirect("/campgrounds");
        })
    })
});

//LOGIN ROUTES
router.get("/login", (req, res) => {
    res.render("auth/login");
})

//login logic
router.post("/login",
    //middleware
    passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        successFlash: `Welcome Back !`,
        failureFlash: "Username or Password were invalid"
    }), (req, res) => {
        //empty for now
    })

//LOGOUT ROUTES
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfuly Logged Out")
    res.redirect("/campgrounds")
})

//FORGOT PASSWORD ROUTES
router.get("/forgot", (req, res) => {
    res.render("auth/forgot");
});

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
            console.log("generated token");
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, foundUser) {
                if (!foundUser) {
                    req.flash('error', 'No account found with that e-mail address');
                    res.redirect("/forgot");
                }
                foundUser.resetPasswordToken = token;
                foundUser.resetPasswordExpire = Date.now() + 36000000; //1 hour
                foundUser.save(function (err) {
                    done(err, token, foundUser);
                });
            });
            console.log("found user with email");
        },
        function (token, user, done) {
            const smptTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'guyhavivcodes@gmail.com',
                    pass: process.env.GMAILPW
                },
                //Added because of a valid certificate error
                tls: {
                    rejectUnauthorized: false
                }
            });
            console.log(user.email);
            const mailOptions = {
                to: user.email,
                from: 'guyhavivcodes@gmail.com',
                subject: 'YelpCamp password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smptTransport.sendMail(mailOptions, function (err) {
                if (err) console.log("error in sendMail" + err);
                console.log("reset password mail has been sent");
                req.flash('success', `An e-mail was sent to ${user.email} with further instructions`);
                done(err, 'done');
            });
        }], function (err) {
            if (err) return next(err);
            res.redirect('/forgot');
        });
});

router.get("/reset/:token",(req,res)=>{
    User.findOne({resetPasswordToken : req.params.token , resetPasswordExpire : {$gt : Date.now()}},(err,foundUser)=>{
        if(!foundUser){
            req.flash('error',"Password reset token invalid or expired");
            res.redirect("/forgot")
        }
        res.render("auth/reset",{token : req.params.token})
    });
});

router.post("/reset/:token",(req,res)=>{
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken : req.params.token , resetPasswordExpire : {$gt : Date.now()}},(err,foundUser)=>{
                if(!foundUser){
                    req.flash('error',"Password reset token invalid or expired");
                    res.redirect("/forgot")
                }
                if(req.body.newPassword === req.body.confirmPassword){
                    foundUser.setPassword(req.body.newPassword,function(err){
                        foundUser.resetPasswordToken = undefined;
                        foundUser.resetPasswordExpire = undefined;
                        foundUser.save(function(err){
                            req.logIn(foundUser,function(err){
                                done(err,foundUser);
                            })
                        })
                    })
                }else{
                    req.flash('error',"Passwords do not match");
                    return res.redirect("/reset/"+req.params.token)
                }
        })
    },function(user,done){
        const smptTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'guyhavivcodes@gmail.com',
                pass: process.env.GMAILPW
            },
            //Added because of a valid certificate error
            tls: {
                rejectUnauthorized: false
            }
        });
        console.log(user.email);
        const mailOptions = {
            to: user.email,
            from: 'guyhavivcodes@gmail.com',
            subject: 'YelpCamp - Password was changed successfully',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smptTransport.sendMail(mailOptions,function(err){
            req.flash('success',"Your password was changed successfully !");
            done(err);
        });
    }],function(err){
        if(err){
            req.flash('error',"Something bad happend...")
            res.redirect("/campgrounds")
            }
        }
    )
})

//ALL OTHER PAGES
router.get("*", (req, res) => {
    res.send("Page Not Found");
})

// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next()
//     }
//     res.redirect("/login");
// }

module.exports = router;





