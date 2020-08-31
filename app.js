const express   = require("express")
,bodyParser     = require("body-parser")
,mongoose       = require("mongoose")
,methodOverride = require("method-override")
,passport       = require("passport")
,LocalStrategy  = require("passport-local")
,flash          = require("connect-flash")
,Campground     = require("./models/campground")
,Comment        = require("./models/comment")
,User           = require("./models/user")
,seedDB         = require("./seeds")
,app            = express()
,port           = 3000;
require('dotenv').config();
const indexRoutes      = require("./routes/index"),
      campgroundRoutes = require("./routes/campgrounds"),
      commentRoutes    = require("./routes/comments");

// REGULAR SETUP
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.locals.moment = require("moment"); //time data output
mongoose.connect("mongodb://localhost:27017/yelp_camp",{ useNewUrlParser: true , useUnifiedTopology: true } );

// PASSPORT SETUP
app.use(require("express-session")({
    secret : "Survivor Winner's at war is a great season", // should be enviormental
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for global variables in all pages
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ROUTES SETUP
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/",indexRoutes);

//seedDB();
app.listen(process.env.PORT || 3000,process.env.IP,()=>console.log("YelpCamp server has started..."));