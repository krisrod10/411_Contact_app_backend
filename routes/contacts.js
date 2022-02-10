const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();

//Middlewares
const auth = require("../middleware/auth");
const Contact = require("../models/Contact");

// @route    GET api/contacts
// @desc    Get all the contacts of the Logged in User
// @access  Private
router.get('/', auth, async (req, res) => {
    try{
        //Find contacts of the user
        const contacts = await Contact.find({ user:req.user.id });

        if(contacts.length > 0){
            return res.json(contacts);
        } else {
            return res.status(400).json({ msg: "No contacts found!" });
        }
    } catch (error){
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
});

// @route   POST api/contacts
// @desc    Add a new contact for the Logged in User
// @access  Private
router.post(
    "/",
    [
        auth,
        [
            check("name", "Name is Required!").exists(),
            check("emai", "Please provide a valid Email").isEmail(),
            check("phone", "Phone Number is Required!").exists(),
        ],
    ],
    async(req, res) => {
        //Checking Validation Errors
        const errors = validationResults(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // If NO VALIDATION ERROR, then proceed to store in DB
        const { name, email, phone, type } = req.body;

        //Checking for Duplicate Contact Entry with check unique email/phone
        let isDuplicate = await Contact.find({
            $and: [
                { user: req.user.id },
                { $or: [{ email: email}, { phone: phone }] },
            ],
        });

        if(isDuplicate.length > 0){
            return res.status(400).json({
                msg: `Duplicate entry attempted! A contact with that ${
                    email == isDuplicate[0].email ? "Email": "Phone Number"
                } already exists!`,
            });
        }

        // If request is not dupliacte, then proceed and store in DB
        try{
            let newContact = new Contact({
                name, 
                email,
                phone,
                type,
                user:req.user.id
            });

            newContact = await newContact.save();
            res.json(newContact);
        }catch(error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    }
);

// @route   PUT api/contacts
// @desc    Update a contact of the Logged in User
// @access  Private

router.put("/:id", auth, async(req, res) => {
    const { name, email, phone, type } = req.body;

    // Building contactFields object
    let contactFields = {};

    // Checking if the fields exist and then running validation
    if(name){
        await check("name", "Please provide a Name!").exists().run(req);
        contactFields.name = name;
    }
    if(email){
        await check("email", "Please Provide a valid Email!").isEmail().run(req);
        contactFields.email = email;
    }
    if(phone){
        await check("phone", "Please provide a phone number").exists().run(req);
        contactFields.phone = phone;
    }
    if(type){
        check("type", "Please provide a Contact Type!").exists().run(req);
        contactFields.type = type;
    }
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
    return res.status(400).json({ erros: errors.array() })

    try{
        // Fetching contact from db
        let contact = await Contact.findById(req.params.id);

        // check if contact exists or not
        if(!contact) return res.status(404).json({ msg: "Contact Not Found!" });

        // checking if the contacs owner is as same as the incoming request maker by matching users id's
        if(contact.user != req.user.id)
        return res.status(401).json( "Un-Authorized Attempt!" );

        // If user is authorized, proceed

        // check for duplicate email or phone nu,ber in any contact of the user
        const isDuplicate = await Contact.find({
            $and:[
                {user: req.user.id },
                { $or: [{ email: email }, { phone: phone }] },
            ],
        });
        if(isDuplicate.length > 0){
            return res.status(400).json({
                msg: `Duplicate Update Attempt! A contact with that ${
                    email == isDuplicate[0].email ? "Email" : "Phone Number"
                } already exists!`,
            });
        }

        // if not duplicate, proceed
        // save and update DB
        contact = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                $set: contactFields,
            },
            { new: true}
        );
        res.json(contact);
    }catch(error){
        console.error(error);
        res.status(500).send("Internal Server Error!");
    }
});

// @route   DELETE api/contacts
// @desc    Delete a contact of the Logged in User
// @access  Private

router.delete("/:id", auth, async (req, res) => {
    try{
        // fetching contact from db
        let contact = await Contact.findById(req.params.id);

        // check if contact exist or not
        if(!contact) return res.status(404).json({ msg: "Contact not Found!"});

        // checking if the contact's owner is as same as the incoming request maker by matching users ids
        if(contact.user != req.user.id)
        return res.status(401).json({ msg: "Un-Authorized Attempt!" });

        // if user is authorized proceed 
        const isDeleted = await Contact.findByIdAndDelete(req,params.id);
        res.json(isDeleted)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error!");
    }
});

module.exports = router;