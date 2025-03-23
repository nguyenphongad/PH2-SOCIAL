const express = require('express');
const bodyParser  = require('body-parser');
const mongoose  = require('mongoose');
const dotenv  = require('dotenv');
const cors  = require('cors');

// routes
const AuthRoute = require('./routes/AuthRouter');

const path = require('path')

const app = express();

app.use(express.static('public'));
// app.use('/images', express.static("images"));


app.use(bodyParser.json({limit:'30mb',extended: true}));
app.use(bodyParser.urlencoded({limit:'30mb',extended: true}));

app.use(cors());
dotenv.config();

mongoose
    .connect(process.env.MONGODB_URL) 
    .then(()=>{
        app.listen(process.env.PORT,()=>{
            console.log('server AUTH-SERVICE listening at port ' + process.env.PORT);
        })
    })
    .catch((error)=>console.log(error));


app.use('/auth', AuthRoute)