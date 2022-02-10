const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();


//Importing the DB connection 
const mongodbURI = process.env.mongodbURI;

const app = express();

//Body Parser
app.use(express.json());



app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts"));


// Connecting to MongoDB
mongoose.connect(
    mongodbURI,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true,
        useFindAndModify:false,
    },
    (err, res) => {
        if(err)
        console.error(`Error occured while connecting to MongoDB! \n${err}`)
        else console.log("MongoDB Connected...");
    }
)

// Setting up server port
const PORT = process.env.PORT || 5000;

// Starting server
app.listen(PORT, (err,res) => {
    if(err){
        console.error(`Error Occured while starting server! ${err}`);
    } else {
        console.log(`Server Started at Port ${PORT}...`)
    }
});