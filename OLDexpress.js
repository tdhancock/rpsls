//require stuff
const express = require('express');
var cors = require('cors')
const axios = require('axios');
const mongoose = require('mongoose');
const Player = require("./Player.js");
const http = require('http');
const { Server } = require("socket.io");

//initialization
const app = express();
app.use(cors())
app.use(express.json())
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

//db stuff
run().catch(err => console.log(err));

async function run() {

    // await mongoose.connect('mongodb://localhost:27017/test2');
    // console.log("connected")
    // const user = new Player({id:"testId", displayName:"tdhancock", wins: 12, losses: 0})
    // await user.save()
    // console.log(user)
    // console.log(await Player.find())
}

//REST endpoints
app.get('/', (req, res) => {
    //res.send('Hello World, from express');
    res.sendFile(__dirname + '/index.html');
})

app.get('/user', (req, res) => {
    res.send(user)
})

app.post("/api/login", (req, res) => {
    console.log("Request \n")
    console.log(req.body)
})

app.post("/api/register", (req, res) => {
    res.send("registered")
})

app.get("/api/game", (req, res) => {
    res.send({success:true, rooms: rooms})
})

app.post("/api/game", (req, res) => {
    res.send("Create game")
})

app.put("/api/game/join", (req, res) => {
    res.send("Join game")
})

app.put("/api/game/watch", (req, res) => {
    res.send("Watch game")
})

//Socket.io
io.on('connection', (socket) => {

    //chat message from getting started with socket.io
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    //main rpsls
    socket.on('rpsls', (msg, room) => {
        if (room === '' ){
        socket.broadcast.emit('rpsls', msg);
        }
        else{
        socket.to(room).emit('rpsls', msg);
        }
        });

        //join room for specific game
    socket.on('join-room', (room, cb) => {
        socket.join(room)
        cb(`Joined ${room}`);
    })

        //leave room
    socket.on('leave-room', (room, cb) => {
        //socket.leave(room);
        cb(`Left ${room}`)
    })

    socket.on('created-room', (room) => {
        socket.broadcast.emit('created-room', room);
    })
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))

//spoofed db for development purposes
let user = {name: "tanner", msg: "hello from tanner"}
let rooms = [{name: "room1"}, {name:"room2"}, {name:"room3"}]