const express = require('express');
const app = express();
const mongoose = require('mongoose');
const server = require('http').createServer(app);

require('dotenv/config')

//Connect to mongodb
mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser:true,  useUnifiedTopology: true})
        .catch(err=>{
            console.error(err);
        });
const connection = mongoose.connection;
connection.once('open', ()=>{
    console.log('connected to db!');
})


//Import Routes
const recipesRoute = require('./routes/recipes');


//MIDDLEWARES
app.use(express.json());
app.use('/recipes',recipesRoute);



server.listen(3000,()=>{
    console.log("Server is running on port: ",3000);
});