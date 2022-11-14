//Set up express server
const express = require('express');
const app = express();
var cors = require('cors')
app.use(cors())
app.use(express.json())
const Player = require("./Player.js")

//Set up socket.io server
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://192.168.1.33:8080']
  }
});

//Set up mongoose
const mongoose = require('mongoose');
const { table } = require('console');
const { find } = require('./Player.js');

//Mongoose stuff
run().catch(err => console.log(err));

async function run() {
  await mongoose.connect('mongodb://localhost:27017/prod1');
  // Player.deleteMany({dislayName: "test"}).then(function(){
  //  console.log("Data deleted")});
  //console.log( await Player.find())
  // const user = new Player({email:"test@gmail.com", displayName:"test",password:"test", wins: 10, losses: 0})
  // await user.save()
  // let x = await Player.findOneAndUpdate({_id: "636867b09f54708139fb04ff"}, {$inc: {wins: 1}})
  // console.log(x)
  // let y = await Player.findOne({_id: "636867b09f54708139fb04ff"})
  // console.log(y)
  // let y = Player.findById("adfadsfasfd")
  // console.log(y.displayName)
}

//Socket.io connections
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('join-room', (room, cb) => {
    if(io.sockets.adapter.rooms[room])
    {
      //console.log(`${room} exists`)
     //if room exist
    }
    socket.join(room)
    if(!choices[room]){
      choices[room] = {choice1id: null, choice1name: null, choice1: null, choice2id: null,choice2name: null, choice2: null}
    }
    //console.log(room)
    //console.log(rooms)
    currRoom = rooms.findIndex(x => x.id === room);
    //console.log(rooms[currRoom])
    //console.log(rooms[currRoom]);
    io.to(room).emit('gameUpdate', rooms[currRoom]);
    cb(`Joined ${room}`);
  })
  socket.on('leave-room', (room, cb) => {
    socket.leave(room)
    cb(`Left ${room}`);
  })

  socket.on('rpsls-bits', (b) => {
    let ab = bufToArrayBuf(b)
    let info = processAB(ab)
    console.log(info);
  })

  //old rpsls
  socket.on('rpsls', (b) => {
    let ab = bufToArrayBuf(b)
    let info = processAB(ab)
    console.log(info)
    let choice = info[0];
    let comment = info[1];
    let emoji = info[2];
    let id = info[3];
    let displayName = info[4]
    let room = findRoomId(id);
    if(comment){
      io.in(room).emit("comment", [displayName, comment])
    }
    //console.log()
    if(choice){

      let decision = makeChoice(room, choice, id, displayName);
      if(decision){
        if(decision == 7){
          io.in(room).emit('rpsls', [7]);
          choices[room] = {choice1id: null, choice1: null, choice2id: null, choice2: null}
          rooms.pop({id:room})
          //console.log("Rooms after removing current room")
          //console.log(rooms)
          io.in(room).socketsLeave(room);
          io.in(room).disconnectSockets()
        }else{

          let player1Name = decision[2]
          let player2Name = decision[4]
          //console.log(player1Name, player2Name)
          let verdict = createVerdict(decision[1], decision[3],player1Name ,player2Name ,decision[0][0])
          console.log("this is the verdict")
          console.log(verdict)
          io.in(room).emit('rpsls', verdict);
          if(choices[room].choice1id = decision[1]){
            addWinLoss(choices[room].choice1id, choices[room].choice2id)
          }
          else{
            addWinLoss(choices[room].choice2id, choices[room].choice1id)
          }
          choices[room] = {choice1id: null, choice1: null, choice2id: null, choice2: null}
          rooms.pop({id:room})
          //console.log("Rooms after removing current room")
          //console.log(rooms)
          io.in(room).socketsLeave(room);
          io.in(room).disconnectSockets()
          //console.log(`User in room ${room} disconnected`)
        }
      }
    }
  });
});

async function getPlayerDisplayName(id){
  let name = await Player.findOne({id: id})
  console("Here is the name: ")
  //console.log(name);
}

function findRoomId(id){
  let roomIndex = null;
    for(i=0;i<rooms.length;i++){
      if(rooms[i].id == id){
        roomIndex = i;
        //console.log(roomIndex)
      }
    }
    if(!roomIndex && roomIndex!=0){

      roomIndex = rooms.findIndex(x => x.player2.id === id);
      //console.log(roomIndex)
    }
    return rooms[roomIndex].id;
}

//Switch buffer to array buffer
function bufToArrayBuf(buf){
  //console.log(buf.length)
  let ab = new ArrayBuffer(buf.length)
  let dv = new DataView(ab);
  for(i=0;i<buf.length;i++){
    dv.setUint8(i, buf[i])
  }
  return ab;
}

//PROCCESS ARRAY BUFFER
function processAB(ab) {
  //create data view for buffer
  let dv = new DataView(ab)
  //put all of this data into an array, way easier to work with
  let array = []
  for (i = 0; i < dv.byteLength; i++) {
      array.push(dv.getInt8(i))
  }
  //process this array of commands/data
  return processCommands(array);
}

function processCommands(array){
  //Decide which commands are in what order
  let x ;
  let i = 0;
  //Mask for if more commands
  let mask = 0b10000000;
  //Mask for what command
  commandMask = 0b01110000
  //These will be the values for certain commands when we use the mask.
  //Second item in array shows byte size of command
  commands = 
  {0: ["move", 1], 16: ["text", 2], 48: ["emoticon", 2], 64: ["id", 2], 
   80: ["name", 2], 96: ["verdict", 8]}
  //array to store commands, in order
  currentCommands = []
  //how many bytes does the command section take up? 
  let commandSize = 0;
  while(x != 0){
      //Push whatever the first command is
      currentCommands.push(commands[commandMask & array[i]][0])
      // console.log(currentCommands)
      //Check if there are more commands
      //Will end the loop if 0
      x = mask & array[i]
      //updating how many bits the commands take
      commandSize += commands[commandMask & array[i]][1]
      
      //updating what item in the array we will check for the next command
      //ex text takes two bytes, so if first command we need to check 3rd byte for next command
      i += commands[commandMask & array[i]][1];
  }
  
  // console.log("command size : " + commandSize)
  //will be what we index the array with
  offset=0;
  y = 0;
  pulledApart = {move: [], text: [], emoticon: [], id: [], name: []}
  currentCommands.forEach(command => {
      if(command == "move"){
          //Mask to check which rpsls
          moveMask = 0b1111
          //Add to the list of parsed commands
          //console.log(moveMask & array[y])
          pulledApart.move.push(moveMask & array[y])
          //offset++;
      }else if (command == "text"){
          //Increment once because it is a 2 byte command
          y++
          //Mask to check how many characters in the text
          textMask = 0b11111111
          //How many character? 
          let textSize = (textMask & array[y]) -1
          //Loop through the array and grab the text
          for(i = commandSize + offset; i < commandSize + offset + textSize; i++){
              //add text to the parsed commands
              pulledApart.text.push(array[i])
          }
          offset += textSize;
      }else if (command == "emoticon"){
          //get first 4 bits
          let first4 = (0b1111 & array[y]).toString(2).padStart(4, '0');
          y++;
          let emote = first4 + (array[y]).toString(2).padStart(8, '0')
          pulledApart.emoticon.push(parseInt(emote, 2))
          //console.log(y)
          //offset+=2;
          
      }else if (command == "id"){
          first4 = (0b1111 & array[y]).toString(2).padStart(4, '0');
          y++;
          idLength = parseInt(first4 + (array[y]).toString(2).padStart(8, '0'),2) - 1

          for(i = commandSize + offset; i < commandSize + offset + idLength; i++){
              //add text to the parsed commands
              pulledApart.id.push(array[i])
          }
          offset += idLength;
          
      }else if (command == "name"){
          y++;
          nameLength = array[y] - 1;
          for(i = commandSize + offset; i < commandSize + offset + nameLength; i++){
              //add text to the parsed commands
              pulledApart.name.push(array[i])
          }
          offset += nameLength;
      }
      y++
  })
  // console.log(pulledApart)
  let m;
  let t;
  let e;
  let id;
  let n;

  //get move
  if(pulledApart.move[0] || pulledApart.move[0]==0){
     m = processMove(pulledApart.move)
  }
  else{
      console.log("No Move")
  }

  //get text
  if(pulledApart.text[0]){
      t = processText(pulledApart.text)
  }else{
      console.log("No Text")
  }

  //get emoticon
  if(pulledApart.emoticon[0]){
      e = processEmoticon(pulledApart.emoticon)
  }else{
      console.log("No Emoticon")
  }

  //get id
  if(pulledApart.id[0]){
      id = processId(pulledApart.id)
  }else{
      console.log("No ID")
  }

  //get name
  if(pulledApart.name[0]){
      n = processName(pulledApart.name)
  }else{
      console.log("No Name")
  }
  
  
  // console.log("MOVE = " + m)
  // console.log("TEXT = " + t)
  // console.log("EMOTE = " + e)
  // console.log("ID = " + id)
  // console.log("NAME = " + n)
  return([m,t,e,id,n])
}

function processMove(move){
  moves = [["rock", 1], ["paper", 2], ["scissors", 4], ["lizard", 8], ["spock", 0]]
  for(i = 0; i < moves.length; i++){
      if(moves[i][1] == move[0]){
          //console.log(moves[i])
          let ret = moves[i][0]
          return ret
      }
  }
}

function processText(text){
  let x = String.fromCharCode(...text)
  return x;
}

function processEmoticon(emote){
  let x = String.fromCodePoint(126976 + emote[0])
  return x;
}

function processId(id){
  let x = String.fromCharCode(...id)
  return x;
}

function processName(name){
  let x = String.fromCharCode(...name)
  return x;
  
}

function createVerdict(id1, id2, name1, name2, verdictText){
  commands = []
  data = []
  // let id1 = "63686c8693671ccee36e36e0"
  // let id2 = "63686c8693671ccee36e36e1"
  // let name1 = "tanner"
  // let name2 = 'landon'
  // let verdictText = "Rock crushes paper tanner wins"
  let verdictCommand = "01100000"
  commands.push(verdictCommand)
  let length = id1.length
  //winner id
  id1Command =length.toString(2).padStart(12, "0")
  let first = id1Command.substring(0,8)
  let remaining = id1Command.substring(8)
  //console.log(first, remaining)
  commands.push(first)
  for(i=0;i<id1.length;i++){
      data.push(id1.charCodeAt(i))
  }

  //winner name
  length = name1.length
  winnerNameCommand = length.toString(2).padStart(12, "0")
  first = winnerNameCommand.substring(0,4)
  commands.push(remaining + first)
  remaining = winnerNameCommand.substring(4)
  commands.push(remaining)
  for(i=0;i<name1.length;i++){
      data.push(name1.charCodeAt(i))
  }
  
  //loser id
  length = id2.length
  id2Command =length.toString(2).padStart(12, "0")
  first = id2Command.substring(0,8)
  remaining = id2Command.substring(8)
  //console.log(first, remaining)
  commands.push(first)
  for(i=0;i<id2.length;i++){
      data.push(id2.charCodeAt(i))
  }

  //loser name
  length = name2.length
  loserNameCommand = length.toString(2).padStart(12, "0")
  first = loserNameCommand.substring(0,4)
  commands.push(remaining + first)
  remaining = loserNameCommand.substring(4)
  commands.push(remaining)
  for(i=0;i<name2.length;i++){
      data.push(name2.charCodeAt(i))
  }

  //verdictText
  verdictTextLength = verdictText.length
  verdictTextCommand = verdictTextLength.toString(2).padStart(8, "0")
  commands.push(verdictTextCommand)
  for(i=0;i<verdictText.length;i++){
      data.push(verdictText.charCodeAt(i))
  }
  
  let ab = new ArrayBuffer(commands.length + data.length)
  let dv = new DataView(ab)
  for(i=0;i<commands.length;i++){
      dv.setInt8(i,parseInt(commands[i], 2))
  }
  for(i=0;i<data.length;i++){
      dv.setInt8(i + commands.length, data[i])
  }

  return ab;
  //processVerdict(ab)
}

function makeChoice(room, msg, id, name){
  //console.log(id)
  //console.log(Player.findById(id))
  let decide = choices[room]
  if(!decide){
    //console.log("How are you doing this?")
  }else{
    if(!decide.choice1){
      decide.choice1id = id;
      decide.choice1 = msg;
      decide.choice1name = name
      return false;
    }else if (!decide.choice2){ 
      decide.choice2id = id;
      decide.choice2 = msg;
      decide.choice2name = name;
      decision = tableLogic[decide.choice1][decide.choice2]
      if(decision[1] == 1){
        return [decision, decide.choice1id,decide.choice1name, decide.choice2id, decide.choice2name] 
      }else if (decision[1] == 2){

        return [decision, decide.choice2id, decide.choice2name,  decide.choice1id, decide.choice1name]
      }
      else{
        return [7]
      }
    }
  }
}

async function addWinLoss(id1, id2){
  let x = await Player.findOneAndUpdate({_id: id1}, {$inc: {wins: 1}})
  //console.log(x.wins)
  let y = await Player.findOneAndUpdate({_id: id2}, {$inc: {losses: 1}})
  //console.log(y.losses)
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
http.listen(3000, () => {
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