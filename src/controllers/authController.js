const { Router } =   require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const verifyToken = require('./verifyToken');

//OBTENCION DE INFORMACION DEL USUARIO
router.get('/me', verifyToken, async (req, res, next) => {
    const user = await User.findById(req.userId, {password: 0});
    if(!user){
        return res.status(404).send('No user found');
    }

    res.json(user);
});

//CREACION DE UN USUARIO
router.post('/signup', async (req, res, next) => {
    const { username, email, password } = req.body;
    const user = new User({
        username,
        email,
        password
    });

    user.password = await user.encryptPassword(password);
    user.save();

    const token = jwt.sign({id: user._id}, config.secret, {expiresIn: 60 * 60 * 24});

    res.json({auth:true, token});
});

router.post('/signin', async (req, res, next) => {
    const {email, password } = req.body;
    const e_mail = await User.findOne({email:email});

    if(!e_mail){
        return res.status(404).send("The email doesn't exists");
    }

    const validPassword = await e_mail.validatePassword(password);
    if(!validPassword){
        return res.status(401).json({
            auth: false,
            message: "The password is incorrectly",
            token: null
        });
    }

    const token = jwt.sign({ id: user_id }, config.secret, { expiresIn: 60 * 60 * 24 });
    
    res.json({auth: true, token: token});
});

module.exports = router;