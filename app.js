//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();
const port = 3005;


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our big cruncyr alpha male secret",
    resave : false,
    saveUniitialized: false
}));
//initiliasing passport
app.use(passport.initialize());
app.use(passport.session());

//mongodbconnect
mongoose.connect("mongodb+srv://gupta14aynat:QlBOCCTW6x0IN9DY@cluster0.qiivb9y.mongodb.net/userDB", { useNewUrlParser: true })


const db = mongoose.connection;
db.on('error', console.error.bind(console, ' MongoDb connection error: '));
//schema create for userSelect: 
const UserSchema = new mongoose.Schema({
 email: String,
 password: String
})



//passport plugin--does heavy lifting
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

//model create
const User = new mongoose.model("User",UserSchema)

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
   
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3005/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",(req,res)=>{
    res.render("home");
    console.log("/home pr hai")
})
app.route('/auth/google')
  .get(passport.authenticate('google', {
    scope: ['profile']
  }));

app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/secrets');
});  
app.get("/login",(req,res)=>{
    res.render("login");
    console.log("/login pr hai")
})
app.get("/register",(req,res)=>{
    res.render("register");
    console.log("/register pr hai")
})
app.get("/secrets",(req,res)=>{
    //if not logined redirect to register
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})
app.post("/register",(req,res)=>{
  
    User.register({ username: req.body.username},
        req.body.password ,
        function(err,user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req,res,function(){
                    //if cookie
                    res.redirect("/secrets");
                })
            }
        })
    
});

app.post("/login",async(req,res)=>{
   
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.logIn(user, function(err){
       if(err)
        console.log(err);
       else{
        passport.authenticate("local")(req,res ,function(){
          res.redirect("/secrets");
        })
       }
    })
})

app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err)
            console.log(err);
        else
           res.redirect("/");
    });

})
app.listen(port, function(){
    console.log(`server listening on ${port} Port`);
})