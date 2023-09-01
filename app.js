//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
const port = 3005;
console.log(process.env.API_KEY)

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

//mongodbconnect
mongoose.connect("mongodb+srv://gupta14aynat:QlBOCCTW6x0IN9DY@cluster0.qiivb9y.mongodb.net/userDB", { useNewUrlParser: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, ' MongoDb connection error: '));
//schema create for userSelect: 
const UserSchema = new mongoose.Schema({
 email: String,
 password: String
})


UserSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields : ['password']});

//model create
const User = new mongoose.model("User",UserSchema)


app.get("/",(req,res)=>{
    res.render("home");
    console.log("/home pr hai")
})
app.get("/login",(req,res)=>{
    res.render("login");
    console.log("/login pr hai")
})
app.get("/register",(req,res)=>{
    res.render("register");
    console.log("/register pr hai")
})
app.post("/register",(req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser
    .save()
    .then(()=>{
        res.render("secrets");
    })
    .catch((err)=>{
        console.log(err);
    });
    
})

app.post("/login",async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    try{
       const foundName = await User.findOne({email: username})
       if(foundName){
        if(foundName.password === password)
             res.render("secrets");
        else{
            console.log("password does not match.Try Again!")  
           
        }
             
       }else{
        console.log("user not found");
        
       }
          
    }catch(err){
        console.log(err);
    }
})

app.listen(port, function(){
    console.log(`server listening on ${port} Port`);
})