console.log("app.js loaded")
const express=require('express')
const cors=require('cors')

const app=express()

// routes imports

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// routes 


//test route 
app.get("/", (req, res) => {
  res.send("API is running !");
});

module.exports=app


