const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // Đã thiếu module này
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

//
const MessageRoute =  require("./routes/MessageRoute")

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        server.listen(process.env.PORT, () => {  // Dùng server thay vì app.listen()
            console.log('server CHAT-SERVICE listening at port ' + process.env.PORT);
        });
    })
    .catch((error) => console.log(error));

// Socket.io Setup
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('sendMessage', (data) => {
        io.emit('newMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

module.exports = io; 

app.use('/chat', MessageRoute)
