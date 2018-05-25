var express    = require("express"),
    app        = express(),
    bodyparser = require("body-parser"),
    mongoose   = require("mongoose"),
    Camps      = require("./models/campground"),
    Comment    = require("./models/comment"),
    User       = require("./models/user"),
    seedDB     = require("./seeds"),
    passport   = require("passport"),
    LocalStretegy = require("passport-local"),
    User       = require("./models/user");
app.use(express.static("public"));
app.use(require("express-session")({
secret:"once again",
resave:false,
saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStretegy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");  
app.use(function(req, res, next){
    res.locals.currentuser = req.user;
    next();
});


//SChema setup


    // Camps.create(
    //     { 
    //         name: "Granite Hill", 
    //         image: "https://images.pexels.com/photos/878251/pexels-photo-878251.jpeg?auto=compress&cs=tinysrgb&h=350" ,
    //         description:" this is a very beautiful destination"
    //     }, function (err, Camps) {
    //         if(err)
    //             {console.log(err);}
    //         else
    //             {
    //                 console.log("added!!!");
    //                 console.log(Camps);
    //         }
    //     });


app.get("/",function(req, res){
    res.render("landing.ejs");
});

app.get("/index",function(req, res){
    // res.render("landing");
    // get all campgrounds from data base
    Camps.find({}, function (err, allCampgrounds) {
    
        if(err)
            console.log("err");
        else
            res.render("index", { campgrounds: allCampgrounds });     
        
    });

    // res.render("campgrounds",{campgrounds:campgrounds});
});


app.post("/index",function(req, res){
    //get data from form and add data to array
    //redirect to campground page
    // res.send("BOOm");
    var name = req.body.name;
    var image = req.body.imageurl;
    var desc = req.body.descp;
    var newCamp = {name: name, image: image, description: desc}
    // campgrounds.push(newCamp);
    //create a new campground and save to DB
    Camps.create(newCamp,islogged ,function (err, newCamps) {
        if (err)
            console.log(err);
        else{
            res.redirect("/index");
        }

    });
//    res.redirect("/index"); 
});

app.get("/index/new",islogged ,function(req, res){
    //render form
    res.render("new");    
});


app.get("/index/:id",function (req, res) {

    Camps.findById(req.params.id).populate("comments").exec (function(err, foundCamps){
            if(err)
                console.log(err);

            else {
                console.log(foundCamps)
                res.render("show", {campground: foundCamps});
            }
    });
});

app.get("/index/:id/comments/new",islogged ,function(req, res){
    
    Camps.findById(req.params.id, function(err, campground){
        if(err){
            console.log (err);
        }
        else{
            res.render("commentsnew",{campground : campground});
        }
    });

});

app.post("/index/:id/comments", function(req, res){
    
    Camps.findById(req.params.id, function(err, returnid){
        if(err){
            console.log(err);
            redirect("/index");
        }
        else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    returnid.comments.push(comment);
                    returnid.save();
                    res.redirect('/index/' + returnid._id );
                }
            });
        }
    });
});


app.get("/register",function (req, res) {
    res.render("register");
    
})
app.post("/register", function(req, res){
    var newuser = new User({ username: req.body.username });
   User.register(newuser,req.body.password, function (err, user) {
     if(err){
         console.log(err);
         return res.render("register");
     }
     passport.authenticate("local")(req, res, function(){
         res.redirect("/index");
     })
   });
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/login"
}));

app.get("/logout",function(req, res){
    req.logout();
    res.redirect("/index");
});

function islogged(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");    
}
app.listen(3000, function () {
    console.log("server started");
});