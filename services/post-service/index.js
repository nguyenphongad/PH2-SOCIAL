const express = require('express');
const bodyParser  = require('body-parser');
const mongoose  = require('mongoose');
const dotenv  = require('dotenv');
const cors  = require('cors');


const path = require('path');
const router = require('./routes/PostRoute');


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
            console.log('server POST-SERVICE listening at port ' + process.env.PORT);
        })
    })
    .catch((error)=>console.log(error));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'post-service',
    timestamp: new Date().toISOString()
  });
});

// Cấu hình route với tiền tố 'post'
app.use('/post', router)