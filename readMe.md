REST routes:
name    method  url                  desc.
=========================================
INDEX   GET     /campgrounds         Show all campgrounds in DB
CREATE  POST    /campgrounds         Apply NEW campground into DB and INDEX
NEW     GET     /campgrounds/new     Show "Add campground" form page
SHOW    GET     /campgrounds/:id     Show Extra Info about campground w/ ID from DB