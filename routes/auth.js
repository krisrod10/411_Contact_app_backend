const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
//Using Express Validator to validate incoming request data on server side
const { check, validationResult } = require("express-validator");

//Middlewares
const auth = require('../middleware/auth');

//User Model
const User = require("../models/User");

// @route   GET api/auth
// @desc    Get details of a Logged In user
// @access  Private
router.get("/", auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error){
        console.error(error);
        res.status(500).send("Internal server error!");
    }
});

// @route   POST api/auth
// @desc    Authenticate User and Get Token
// @access  Public
router.post(
    "/",
    [
        check("email", "Please include a valid Email id!").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        //Checking Validation Errors
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        // If not validation errors, proceed
        const { email, password } = req.body;

        try{
            let user = await User.findOne({ email });

            // Checking invalid email
            if(!user){
                return res
                .status(400)
                .json({ msg: "No account was found with this email id!" });
            }

            const isPasswordMacth = await bcrypt.compare(password, user.password);

            //Checking invalid password
            if(!isPasswordMatch){
                return res.status(400).json({ msg:"Wrong Password!" });
            }

            // If email + password is okay then generate JWT token
            // Creating Payload

            const payload = {
                user:{
                    id:user.id,
                },
            };

            // Sign and Create
            jwt.sign(
                payload,
                process.env.jwtSecret,
                {expiresIn: 3600},
                (error, token) => {
                    if(error) throw error;
                    res.json({ token });
                }
            );
            //
        } catch(error){
            console.error(error,message);
            res.status(500).send("Internal server Error!")
        }
    }
);

module.exports = router;