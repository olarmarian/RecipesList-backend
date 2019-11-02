const functions = require('firebase-functions');
const express = require('express');
const app = express();
const limiter = require('express-rate-limit');
const xss = require('xss-clean');
const helmet = require('helmet');

const FBAuth = require('./util/FBAuth');

const { 
    getAllDrinks, 
    getDrinksByType,
    getDrink,
    postDrink,
    uploadeImage,
    deleteDrink,
    editDrink,
    reviewDrink
} = require('./handlers/recipes');

const {
    signup,
    login
} = require('./handlers/users');

const limit = limiter({
    max:5,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests'
}) // use for login branch


//MIDDLEWARES
app.use(express.json({limit:'10kb'}));
app.use(xss());//prevent users HTML & Scripts input
app.use(helmet())

app.post('/users/signup',signup);
app.post('/users/login',limit,login);

app.get('/drinks',getAllDrinks);
app.get('/drinks/:drinkId',getDrink);
app.get('/drinks/type/:type',getDrinksByType);
app.get('/drinks/title/')

app.delete('/drinks/:drinkId',FBAuth,deleteDrink);
app.post('/drinks/:drinkId/edit',FBAuth,editDrink);
app.post('/drinks/save',FBAuth,postDrink);
app.post('/drinks/:drinkId/upload',FBAuth,uploadeImage);
app.post('/drinks/:drinkId/review',FBAuth,reviewDrink);
exports.api = functions.https.onRequest(app);
