const { db } = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignUpData, validateLogInData } = require('../util/validators');

exports.signup = async (req,res) =>{
    const newUser = {
        email: req.body.email,
        username: req.body.username,
        password:req.body.password,
        confirmedPassword:req.body.confirmedPassword
    };

    const { valid, errors } = validateSignUpData(newUser);
    if(!valid){
        return res.status(400).json(errors);
    }
    const noImg = 'no-img.png';
    let token,userId;
    await db.doc(`/users/${newUser.username}`)
            .get()
            .then(doc => {
                if(doc.exists){
                    return res.status(400).json({error:"This username is already taken"});
                }else{
                    return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
                }
            })
            .then(data =>{
                userId = data.user.uid;
                return data.user.getIdToken();
            })
            .then(idToken =>{
                token = idToken;
                console.log(userId);
                const userCredentials = {
                    username: newUser.username,
                    email:newUser.email,
                    createdAt: new Date().toISOString(),
                    imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                    userId
                }
                return db.doc(`/users/${newUser.username}`).set(userCredentials);
            })
            .then(()=>{
                return res.status(201).json({token});
            })
            .catch(err=>{
                console.error(err);
                if(err.code === 'auth/email-already-in-use'){
                    res.status(400).json({error : 'Email already in use'})
                }else{
                    return res.status(500).json({error: err.code});
                }
            });
}

exports.login = async (req,res)=>{
    const user = {
        email:req.body.email,
        password:req.body.password
    }

    const { valid, errors } = validateLogInData(user);
    if(!valid){
        
        return res.status(400).json(errors);
    }
    await firebase.auth().signInWithEmailAndPassword(user.email,user.password)
        .then(data =>{
            return data.user.getIdToken();
        })
        .then(token =>{
            return res.status(200).json({token});
        })
        .catch(err =>{
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({ error:'Wrong credentials, please try again' })
            }
            return res.status(500).json({error: err.code});
        })
};
