const mongoose = require("mongoose");

const ContactSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    name:{
        type:String,
        reqired:true
    },
    email:{
        type:String,
        require:true,
    },
    phone:{
        type:String,
        reqired: true,
    },
    type:{
        type:String,
        default:"personal",
    },
    date:{
        type:Date,
        default:Date.now,
    },
});

module.exports = mongoose.model("contact", ContactSchema)