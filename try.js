//Set up express server
const express = require('express');
// const app = express();
var cors = require('cors')
const http = require('http')
// app.use(cors())
// app.use(express.json())
const Player = require("./Player.js")

// //Set up socket.io server
// const http = require('http').createServer(app);
// const io = require('socket.io')(http, {
//   cors: {
//     origins: ['http://192.168.1.33:8080']
//   }
// });
const app = express()
app.use(cors())
app.use(express.json())
const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
      origins: ['http://192.168.1.33:8080']
    }
  });

//Set up mongoose
const mongoose = require('mongoose');
const { table } = require('console');

//Mongoose stuff
run().catch(err => console.log(err));

async function run() {
  await mongoose.connect('mongodb://localhost:27017/test3');
  Player.deleteMany({dislayName: "tdhancock"}).then(function(){
    console.log("Data deleted")});
  const user = new Player({email:"tdhancock@gmail.com", displayName:"tdhancock",password:"test", wins: 10, losses: 0})
  await user.save()
  console.log(await Player.find())
}

//Socket.io connections
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('join-room', (room, cb) => {
    socket.join(room)
    if(!choices[room]){
      choices[room] = {choice1id: null, choice1: null, choice2id: null, choice2: null}
    }
    //console.log(room)
    //console.log(rooms)
    currRoom = rooms.findIndex(x => x.id === room);
    //console.log(currRoom)
    //console.log(rooms[currRoom]);
    io.to(room).emit('gameUpdate', rooms[currRoom]);
    cb(`Joined ${room}`);
  })
  socket.on('leave-room', (room, cb) => {
    socket.leave(room)
    cb(`Left ${room}`);
  })
  //main rpsls
  socket.on('rpsls', (msg, room, id) => {
  if (msg[1] == 1){
    let decision = makeChoice(room, msg, id);
    if(decision){
      io.in(room).emit('rpsls', decision);
      choices[room] = {choice1id: null, choice1: null, choice2id: null, choice2: null}
      rooms.pop({id:room})
      console.log("Rooms after removing current room")
      console.log(rooms)
      io.in(room).socketsLeave(room);
      io.in(room).disconnectSockets()
      console.log(`User in room ${room} disconnected`)
    }
  }
  if(msg[1] == 2){
    io.in(room).emit('rpsls', [msg[0], "chat"])
  }
  });
});

function makeChoice(room, msg, id){
  let decide = choices[room]
  if(!decide){
    console.log("How are you doing this?")
  }else{
    if(!decide.choice1){
      decide.choice1id = id;
      decide.choice1 = msg;
      return false;
    }else if (!decide.choice2){ 
      decide.choice2id = id;
      decide.choice2 = msg;
      decision = tableLogic[decide.choice1][decide.choice2]
      if(decision[1] == 1){
        return [decision, decide.choice1id] 
      }
      else{
        return [decision, decide.choice2id]
      }
    }
  }
}

//REST endpoints

app.post("/api/login", (req, res) => {
    let email = req.body.email
    let password = req.body.password
    //console.log(email, password)
    test(email,password)
    async function test(email, password){
      let ret = await Player.findOne({email: email, password: password})
      //console.log("in find user" + ret)
      if(ret){
        res.send({success: true, data: {player: ret}})
      }else{
        res.send({success: false, error: {msg: "No such player"}})
      }
    }
})

app.post("/api/register", (req, res) => {
    newPlayer = new Player({email: req.body.email, displayName: req.body.displayName, password: req.body.password, wins: 0, losses: 0})
    newPlayer.save()
    f(req.body.email, req.body.password)
    async function f(email, password){
      let ret = await Player.findOne({email: email, password: password})
      //console.log("REGISTER " + ret)
      res.send({success:true, data: {id: ret._id}})
    }
})

app.get("/api/game", (req, res) => {
    res.send({success:true, data: rooms})
})

app.post("/api/game", (req, res) => {
    let player = req.body;
    //console.log(player.id, player.displayName)
    rooms.push({id: player.id, player1: player, player2: null, commentators: [] })
    res.send({success: true})
})

app.put("/api/game/join", (req, res) => {
    let joinRoom = req.body
    //console.log(joinRoom)
    success = false;
    rooms.forEach((room)=>{
      if(joinRoom.room.id = room.id){
        if(!room.player2){
          //console.log("success")
          room.player2 = joinRoom.player;
          //console.log(room)
          res.send({success: true, data: {room: room}})
          success = true;
        }
      }
    })
    if(!success){
      res.send({success: false, error: {msg: "Problem Joining room"}})
    }
})

app.put("/api/game/watch", (req, res) => {
    res.send("Watch game")
})

//set up socket to listen on 3000
server.listen(3000, () => {
  console.log('listening on *:3000');
});

  async function findUser(display){
    let ret = await Player.findOne({displayName: display})
    //console.log("in find user" + ret)
    return ret
}

//spoofed db
//let user = {name: "tanner", msg: "hello from tanner"}

class player {
  constructor(id, displayName, wins=0, losses=0){
    this.id = id;
    this.displayName = displayName;
    this.wins = wins;
    this.losses = losses;
  }
}

class ROOM {
  constructor(id, player1, player2=null, commentators=[]){
    this.id = id;
    this.player1 = player1;
    this.player2 = player2;
    this.commentators = commentators;
  }
} 

//TABLE LOGIC
let tableLogic = {
  "rock" : {"paper": ["paper covers rock", 2],
          "scissors": ["rock crushes scissors", 1],
          "lizard": ["rock crushes lizard", 1],
          "spock": ["spock vaporizes rock", 2],
          "rock": ["rocks do whatever they do", 0]
         },
  "paper" : {"rock" : ["paper covers rock", 1],
          "scissors": ["scissors cuts paper",2],
          "lizard" : ["lizard eats paper", 2],
          "spock" : ["spock disproves paper", 1],
          "paper" : ["papers create a book", 0]
          },
  "scissors": {"rock" : ["rock crushes scissors", 2],
               "paper" : ["scissors cuts paper", 1],
               "lizard" : ["scissors decapitates lizard", 1],
               "spock" : ["spock smashes scissors", 2],
               "scissors" : ["scissors stare at each other with mouths hanging open", 0]
              },
  "lizard": {"rock" : ["rock crushes lizard", 2],
             "paper": ["lizard eats paper", 1],
             "scissors": ["scissors decapitates lizard", 2],
             "spock": ["lizard poisons spock", 1],
             "lizard": ["lizards become friends", 0]
            },
  "spock": {"rock" : ["spock vaporizes rock", 1],
            "paper": ["paper disproves spock", 2],
            "scissors" : ["spock smashes scissors", 1],
            "lizard": ["lizard poisons spock", 2],
            "spock": ["spocks get lost in debate and forget about the game", 0]
           }
}

let rooms = []
let choices = {}
//example structure
//choices["6365bd3caf9b888ba12af6f2"] = {choice1id: null, choice1: "rock", choice2id: null, choice2: null}
//console.log(choices["6365bd3caf9b888ba12af6f2"].choice1)
let choice1;
let choice2;