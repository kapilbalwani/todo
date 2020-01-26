const express= require('express')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')

//const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./usermodel");

const JWT_KEY= "secret";
var app=express();
const checkAuth = require("./check-auth");
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:false}));

const Task=require('./taskmodel')

mongoose
  .connect(
    "mongodb+srv://kapil:kapil@cluster0-3yiya.mongodb.net/tasks"
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.get("/",(req,res,next)=>{
    res.send("hello world")
})

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
  });

app.get("/tasks",checkAuth,(req,res,next)=>{
    Task.find({creator:req.userData.userId})
        .then((fetchedposts)=>{
            //console.log(fetchedposts);
            res.status(200).json(fetchedposts);
        })
        .catch((error)=>{
            console.log(error);
        })
})

app.get("/tasks/:id",(req,res,next)=>{
    Task.findById(req.params.id)
        .then((fetchedpost)=>{
            if(fetchedpost){
                //console.log(fetchedposts);
                res.status(200).json(fetchedpost);
            }
            else{
                res.status(404).json({ message: "Task not found!" });
            }
            
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).json({
                message:"Fetch failed"
            })
        })
})

app.post("/tasks",checkAuth,(req,res,next)=>{
    console.log("From Outside:"+req.body.task);
    const newtask=new Task({
        task:req.body.task,
        date:new Date(),
        creator:req.userData.userId
    })
    console.log(newtask);
    newtask.save()
        .then((task)=>{
            console.log("task added successfully");
            res.status(201).send(task);
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).send("Internal server error")
        })
})

app.delete("/tasks/:id",checkAuth,(req,res,next)=>{
    console.log("delete backend "+req.params.id)
    Task.deleteOne({_id:req.params.id})
        .then((result)=>{
            if (result.n > 0){
                res.status(200).json({"message":"Deletion Successful"});
            }
            else{
                res.status(403).json({"message":"Something went wrong"});
            }
        })
        .catch((error)=>{
            //console.log(error);
        })
})

app.put("/tasks/:id",checkAuth,(req,res,next)=>{

    const updatedtask=new Task({
        _id:req.params.id,
        task:req.body.task,
        date:new Date()
    })
    console.log(updatedtask);
    Task.updateOne({_id:req.params.id},updatedtask)
        .then((result)=>{
            if (result.n > 0){
                res.status(200).json({"message":"Update Successful"});
            }
            else{
                res.status(403).json({"message":"Something went wrong"});
            }
        })
        .catch((error)=>{
            console.log(error);
        })
})

app.post("/users/createuser",(req, res, next) => {
    
      const user = new User({
        email: req.body.email,
        password: req.body.password});
      
      user
        .save()
        .then(result => {
          res.status(201).json({
            message: "User created!",
            result: result
          });
        })
        .catch(err => {
            console.log(err);
          res.status(500).json({
            message: "Invalid authentication credentials!"
          });
        });
    });
  
  app.post("/users/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        fetchedUser = user;
        return (req.body.password== user.password);
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id },
          JWT_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id
        });
      })
      .catch(err => {
          console.log(err);
        return res.status(401).json({
          message: "Invalid authentication credentials!"
        });
      });
  })
  
app.listen(3000)