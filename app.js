var express    = require("express"),
    app        = express(),
    bodyparser = require("body-parser"),
    mongoose   = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//SChema setup

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Camps = mongoose.model("Camps", campgroundSchema);

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
    //create a new campground and save ro DB
    Camps.create(newCamp, function (err, newCamps) {
        if (err)
            console.log(err);
        else{
            res.redirect("/index");
        }

    });
//    res.redirect("/index"); 
});

app.get("/index/new",function(req, res){
    //render form
    res.render("new");    
});


app.get("/index/:id", function (req, res) {

    Camps.findById(req.params.id, function(err, foundCamps){
            if(err)
                console.log(err);

            else {
                res.render("show", {campground: foundCamps});
            }
    });


    
});



app.listen(3000, function () {
    console.log("server started");
});