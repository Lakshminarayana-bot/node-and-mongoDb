const express = require("express")
const app = express()
const path = require('path')
const mongoose = require("mongoose")
const ejsmate = require("ejs-mate")
const Campground = require("./models/campground")
const methodOverride = require("method-override")
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/ExpressError")
const joi = require("joi");
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require("./models/review")
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews")
const session = require("express-session");
const flash = require("connect-flash");



app.set("view engine", 'ejs')
app.set("views", path.join(__dirname, "views"))

app.engine("ejs", ejsmate)
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false

})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connection open")
})
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

const sessionConfig = {
    secret: "this could be a secret",
    resave: false,
    saveUnintiated: true,
    cookie: {
        HTTPOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig))
app.use(flash());




app.get('/', (req, res) => {
    res.render("home")
})
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    next()
})

app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)
app.use(express.static(path.join(__dirname, 'public')))




app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) {
        err.message = "oh no!!!! somethind went wrong";
    }
    if (!err.statusCode) err.statusCode = 400;

    console.log(err.statusCode)
    res.status(statusCode);
    res.render("error", { err })
})


app.listen(3000, () => {
    console.log('listening to port 3000')
})