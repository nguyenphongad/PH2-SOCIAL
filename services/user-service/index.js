const express = require('express');
const bodyParser  = require('body-parser');
const mongoose  = require('mongoose');
const dotenv  = require('dotenv');
const cors  = require('cors');

// routes
// const AuthRoute = require('./routes/AuthRouter');
const UserRouter = require('./routes/UserRoute.js');
// const PostRoute  = require('./Routes/PostRoute.js');
// const UploadRoute = require('./Routes/UploadRoute.js');
// 
// const ChatRoute  = require('./Routes/ChatRoute.js');
// const MessageRoute = require("./Routes/MessageRoute.js");

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
            console.log('server USER-SERVICE listening at port ' + process.env.PORT);
        })
    })
    .catch((error)=>console.log(error));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// app.use('/auth', AuthRoute)
app.use('/user', UserRouter)
// app.use('/post', PostRoute)
// app.use('/upload', UploadRoute)
// app.use('/chat', ChatRoute)
// app.use("/message", MessageRoute)