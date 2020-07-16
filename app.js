var express          = require("express"),
	app		         = express(),
	bodyParser       = require("body-parser"),
	request          = require("request"),
	mongoose         = require("mongoose"),
	methodOverride   = require("method-override"),
	expressSanitizer = require("express-sanitizer");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//DataBase connection
mongoose.connect('mongodb://localhost:27017/RESTful_blog', {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

.then(() => console.log("Connected to DB"))
.catch(error => console.log(error.message));

//MONGOOSE config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

//MONGOOSE/MODEL config
var Blog = mongoose.model("Blog", blogSchema);

//Initial Database
// Blog.create({
// 	title: "Test Blog",
// 	image: "https://www.sciencemag.org/sites/default/files/styles/article_main_large/public/dogs_1280p_0.jpg?itok=cnRk0HYq",
// 	body: "This is the test Blog post on awesome dogs"
// });

//RESTful ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});

//Index Route
app.get("/blogs", function(req, res){
	Blog.find({}, function(error, blogs){
		if(error){
			console.log(error);
		}else{
			res.render("index", {blogs: blogs});
		}
	});
});

//New Route
app.get("/blogs/new", function(req, res){
	res.render("new");
});

//Create Route
app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(error, newBlog){
		if(error){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});

//Show Route
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(error, foundBlog){
		if(error){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog: foundBlog});
		}
	});
});

//Edit Route
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(error, foundBlog){
		if(error){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

//Update Route
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(error, updateBlog){
		if(error){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//Delete Route
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(error){
		if(error){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

//app listen config
app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("Server for Blog has started!");
});