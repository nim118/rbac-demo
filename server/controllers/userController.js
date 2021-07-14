const user    = require('../models/userModel');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcrypt');
const {roles} = require('../roles')

exports.grantAccess = function(action, resource) {
    return async (req, res, next) => {
        try{
            const permission = roles.can(req.user.role)[action](resource);
            if(!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                })
            }
            next()
        }
        catch (error) {
            next(error)
        }
    }
}

exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if(!user) {
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
        }
        else {
            req.user = user;
            next();
        }
            
           
    } catch (error) {
        next(error);
    }
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10)
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
    try {
        const {email, password, role} = req.body
 
        const hashedPassword = await hashPassword(password);
        const newUser        = new user({email, password: hashedPassword, role: role || 'basic'});
        const accessToken    = jwt.sign({userID: newUser._id}, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        newUser.accessToken = accessToken;

        await newUser.save();
        res.json({
            data: newUser,
            accessToken
        })
    }
    catch (error) {
        next(error)
    }
 }


 exports.login = async (req, res, next) => {
     try {
        const {email, password} = req.body;
        const user = await user.findOne({email});
        if (!user) return next(new Error("Email doesn't exists"));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return next(new Error("Password is not correct"));
        const accessToken = jwt.sign({userID: user._id}, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        await user.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({
            data: { email: user.email, role: user.role},
            accessToken
        })
     }
     catch (error){
        next(error);
     }
 }

 exports.getUsers = async (req, res, next) => {
     const users = await user.find({});
     res.status(200).json({
         data: users
     });
 }

 exports.getUser = async (req, res, next) => {
     try {
        const userID = req.params.userId;
        const user = await user.findById(userId);
        if (!user) return next(new Error("User doesn't exist"));
        res.status(200).json({
            data: user
        });
     } catch (error) {
         next(error)
     }
 }

 exports.updateUser = async (req, res, next) => {
     try {
         const update = req.body
         const userId = req.params.userID;
         await user.findByIdAndUpdate(userId, update)
         const user = await user.findById(userId)
         res.status(200).json({
             data: user,
             message: "User has been updated"
         });
     }
     catch (error) {
         next(error)
     }
 }

 exports.deleteUser = async (req, res, next) => {
     try {
        const userId = req.params.userId;
        await user.findByIdAndDelete(userId);
        res.status(200).json({
            data: null,
            message: 'user has been deleted'
        });
     }
     catch (error) {
         next(error)
     }
 }