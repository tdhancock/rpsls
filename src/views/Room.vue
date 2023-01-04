<template>
  <div class="items-center justify-center flex flex-col bg-sky-300 rounded-3xl m-5 w-3/4 m-auto mt-5 mb-5 h-full">
    <!-- <div class="flex rounded-3xl bg-white m-3 flex-wrap items-center justify-center border-2 border-sky-800 p-3 w-3/5">
      <h1 class='p-3 text-3xl text-sky-800'>{{displayName}}</h1>
      <h2 class='p-3 text-lg'>Wins: {{wins}}</h2>
      <h2 class='p-3 text-lg'>Losses: {{losses}}</h2>
    </div> -->
    <h1 class='m-3 mt-5 text-4xl text-sky-800 rounded-3xl bg-white p-5'>{{roomOwner}}'s Room</h1>
      <div class="items-center flex flex-row justify-center flex-wrap ">
          <div class="flex w-full justify-center items-center m-5">
          <img :src="imageSrc" class="w-1/8">
          </div>
          <form action="submit" class="flex flex-col justify-center items-center">
              <div class="flex justify-center items-center my-5 ml-20" ref="select">

                  <input type="radio" value="rock" ref="rpslsBtn" class="sr-only peer hidden">
                  <label for="rock" class="peer-checked w-1/3"><img src="./images/rock.png" alt="" class="w-1/2 h-1/3" @click="radioButtonChange" id="rock"></label>
          
                  <input type="radio" value="paper" name="rpslsBtn" class="sr-only peer hidden">
                  <label for="paper" class="peer-checked w-1/3"><img src="./images/paper.png" alt="" class="w-1/2 h-1/2" id="paper" @click="radioButtonChange"></label>
          
                  <input type="radio" id="scissors" value="scissors" name="rpslsBtn" class="sr-only peer hidden">
                  <label for="scissors" class="peer-checked w-1/3"><img src="./images/scissors.png" alt="" class="w-1/2 h-1/2" id="scissors" @click="radioButtonChange"></label>

                  <input type="radio" id="lizard" value="lizard" name="rpslsBtn" class="sr-only peer hidden">
                  <label for="lizard" class="peer-checked w-1/3"><img src="./images/lizard.png" alt="" class="w-1/2 h-1/2 " id="lizard" @click="radioButtonChange"></label>

                  <input type="radio" id="spock" value="spock" name="rpslsBtn" class="sr-only peer hidden">
                  <label for="spock" class="peer-checked w-1/3"><img src="./images/spock.png" alt="" class="w-1/2 h-1/2 " id="spock" @click="radioButtonChange"></label>
              </div>
              <div class="flex w-full justify-center items-center mb-5">

                  <input type="text" id="comments" v-model="newComment" class="border-solid border-2 border-sky-800 rounded-2xl p-3 w-full" ref="text">
                  <input @click="submitForm" type="submit" value="Submit" class="button rounded-3xl bg-sky-800 p-3 my-3 ml-3 hover:bg-sky-500 w-full text-sky-100 hover:text-sky-100 text-2xl" ref="sb">
              </div>
            </form>
      </div>
  </div>
</template>

<script >
  import router from '@/router';
  import SocketioService from '../services/socketio.service.js';
  import { useShepherd } from 'vue-shepherd'
  export default{
    name: 'Room',
    data() {
      return {
        imageSrc: '',
        newComment: '',
        selectedChoice: "",
        images : {"rock" : "./img/rock.6d735aa7.png", "paper" : "./img/paper.374f8bc4.png", "scissors": "./img/scissors.000a0341.png", "lizard": "./img/lizard.8ef07161.png", "spock": "./img/spock.3dd2d4a9.png"},
        //roomName: localStorage.getItem(),
        roomOwner: sessionStorage.getItem("roomOwner"),
        room : sessionStorage.getItem("room"),
        //rpsls : [{name: "rock", img: "C:\Users\Tanner\Desktop\cs4690\ninja-jobs\src\views\images\lizard.png"}],
        //rpsls : [["rock", "./images/rock.png"], ["paper", "./images/paper.png"], ["scissors", "./images/scissors.png"], ["lizard", './images/lizard.png'], ["spock", "./images/spockBtn.png"]],
        chat : [],
        displayName: sessionStorage.getItem("displayName"),
        wins: sessionStorage.getItem("wins"),
        losses: sessionStorage.getItem("losses")
      }
    },
    methods: {
      submitForm(e){
        e.preventDefault();
        console.log(this.newComment)
        console.log(this.selectedChoice)
        this.sendrpsls(this.selectedChoice, this.newComment, null)
      },
      radioButtonChange(e){
        this.selectedChoice = e.target.id;
        console.log(this.selectedChoice)
        this.imageSrc = this.images[this.selectedChoice];
        console.log(this.imageSrc)
      },
      startSocketIo() {
        SocketioService.setupSocketConnection();
        //console.log(SocketioService.socket)
        this.socket = SocketioService.socket;
        console.log(this.socket)
      },
      joinRoom(room){
        
        this.socket.emit("join-room", room, message => {
        console.log(message)
        // this.currentRoom = 'test';
        })
      },
      sendMessage() {
        this.socket.emit('rpsls', [this.message, 2], this.room, sessionStorage.getItem("id"))
      },
      sendMove(e){
        console.log(e.target.id)
        this.move = e.target.id;
        this.socket.emit('rpsls', [this.move, 1], this.room, sessionStorage.getItem("id"));
      },
      sendrpsls(move, comment, emoji){
        let ab = this.generateAB(move, comment, sessionStorage.getItem("id"), '😊', sessionStorage.getItem("displayName"))
        console.log(ab)
        this.socket.emit('rpsls', ab)
      },
      generateAB(move, text, id, emoticon, name){
    //spoofed data, will get the real data from the room
    //let move = "scissors"
    // let move = null
    // let text = "Hello, from Tanner wow this is really long, im totally gonna destroy you"
    // let id = "63686c8693671ccee36e36e0"
    // let emoticon = '😏'
    // let name = 'tdhancock'
    let length = 0;
    let moves = [["rock", "0001"], ["paper", "0010"], ["scissors", "0100"], ["lizard", "1000"], ["spock", "0000"]]
    let commands = []
    let data = []

    if(move){
        let moveCommand = "000"
        for(let i = 0; i < moves.length; i++){
            if(moves[i][0] == move){
                moveCommand += moves[i][1]
            }
        }
        length += 1;
        commands.push(moveCommand)
    }if(text){
        let textCommand = "0010000"
        let l = text.length + 1
        textCommand += l.toString(2).padStart(8, "0")
        commands.push(textCommand)
        length += 2;
        for(let i=0; i < l -1; i++){
            data.push(text.charCodeAt(i))
        }
        length += l -1;
    }if(id){
        let idCommand = "100"
        let l = id.length + 1;
        idCommand += l.toString(2).padStart(12, "0")
        commands.push(idCommand)
        length += 2;
        for(let i=0;i<l-1;i++){
            data.push(id.charCodeAt(i))
        }
        length += l -1;
    }if(emoticon){
        let eCommand = "011"
        let eMask = 0b111111111111
        eCommand += (emoticon.codePointAt(0) & eMask).toString(2).padStart(12, "0")
        commands.push(eCommand)
        length += 2
    }if(name){
        let nCommand = "1010000"
        let l = name.length + 1
        nCommand += l.toString(2).padStart(8, "0")
        commands.push(nCommand)
        length +=2 
        for(let i=0;i<l-1;i++){
            data.push(name.charCodeAt(i))
        }
        length += l -1;
    }
    
    //add leading 1 or 0 to commands
    for(let i=0;i<commands.length;i++){
        if(commands[i+1]){
            commands[i] = "1" + commands[i]
        }else{
            commands[i] = "0" + commands[i]
        }
    }
    
    console.log(data)
    console.log(length)
    console.log(commands)

    //create array buffer
    let ab = new ArrayBuffer(length)
    let dv = new DataView(ab);

    //add commands to dv
    let  x = 0;
    let parsedCommands = []
    while(x < commands.length){
        if(commands[x].length == 8){
            parsedCommands.push(parseInt(commands[x], 2))
        }if(commands[x].length == 16){
            let firstHalf = commands[x].substring(0,8)
            let secondHalf = commands[x].substring(8)
            console.log(firstHalf, secondHalf)
            parsedCommands.push(parseInt(firstHalf, 2))
            parsedCommands.push(parseInt(secondHalf, 2))
            //dv.setInt8(i, parseInt(commands[i])
        }
        x++;
    }
    //console.log(parsedCommands.length)
    //console.log(data.length)

    let y = 0;
    for(let i=0;i<parsedCommands.length;i++){
        dv.setInt8(i, parsedCommands[i])
        y++;
    }
    //console.log(y)
    //console.log(dv)
    let w = 0
    while(y<length){
        dv.setInt8(y, data[w])
        w++;
        y++;
    }
    console.log(dv)
    console.log(ab)
    return ab;
}
    },
    async created() {
      if(!this.socket){
        SocketioService.setupSocketConnection();
        //console.log(SocketioService.socket)
        this.socket = SocketioService.socket;
      }
      console.log(this.socket)
      this.room = sessionStorage.getItem("room");
      this.joinRoom(sessionStorage.getItem("room"))

      this.socket.on('rpsls', function(msg) {
        tour.removeStep("curr-step")
        let player1name = sessionStorage.getItem("player1name")
        let player2name = sessionStorage.getItem("player2name")
        let dispName = sessionStorage.getItem("displayName")
        let myName;
        let oppName
        if(player1name == dispName){
          myName = player1name;
          oppName = player2name;
        }else{
          myName = player2name;
          oppName = player1name;
        }
        let tourText;
        if(msg[0] == 7){
          tourText = `<div class='flex flex-col justify-center items-center'><h1 class='text-4xl m-3'>${myName} tied with ${oppName}</h1><p class='text-xl m-3'>Good Game :)</p></div>`
          //alert("TIE GAME!")
          clearItems()
          router.push({name: 'world'})
        }else{
          let decArray = processVerdict(msg)
          let id = sessionStorage.getItem("id")
          if(decArray[0]==id){
            tourText = `<div class='flex flex-col justify-center items-center'><h1 class='text-4xl m-3'>${myName} defeated ${oppName}</h1><h2 class='text-2xl m-3'>${decArray[4]}</h2><p class='text-xl m-3'>You Win :)</p></div>`
            //tourText = decArray[4] + " YOU WIN!"
            //alert(decArray[4] + " YOU WIN!")
            let wins = sessionStorage.getItem("wins");
            sessionStorage.setItem("wins", parseInt(wins) + 1);
            clearItems()
            router.push({name: 'world'})
          }else if (decArray[2]==id){
            tourText = `<div class='flex flex-col justify-center items-center'><h1 class='text-4xl m-3'>${oppName} defeated ${myName}</h1><h2 class='text-2xl m-3'>${decArray[4]}</h2><p class='text-xl m-3'>You Lose :(</p></div>`
            //tourText = decArray[4] + " YOU LOST!"
            //alert(decArray[4] + " YOU LOST!")
              let losses = sessionStorage.getItem("losses");
              sessionStorage.setItem("losses", parseInt(losses) + 1);
              clearItems()
              router.push({name: 'world'})
            }
        }
          tour.addStep({
          id: 'curr-step',
          text: tourText,
          attachTo: {
            element: 'email',
            on: 'right'
          },
          classes: 'bg-sky-500 rounded-xl p-3 text-sky-100 w-1/2 h-1/2 text-4xl flex justify-center items-center mt-5',
          buttons: [
            {
              text: 'Next',
              action: tour.next,
              classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
            }
          ]
        });
          tour.start();
        });
        
        this.socket.on("comment", function(msg){
          //alert(`${msg[0]} says: ${msg[1]}`)
          Notification.requestPermission().then(perm => {
            if(perm === 'granted'){
              console.log("here")
              const notif = new Notification(`${msg[0]} says:`, {
                body: `${msg[1]}`,
                silent: true
            });
        }
    })
      })

      this.socket.on('gameUpdate', function(ROOM) {
        console.log(ROOM.player1.displayName)
        sessionStorage.setItem("roomOwner", ROOM.player1.displayName);
        sessionStorage.setItem("player2", ROOM.player2.id)
        sessionStorage.setItem("player1", ROOM.player1.id)
        sessionStorage.setItem("player2name", ROOM.player2.displayName)
        sessionStorage.setItem("player1name", ROOM.player1.displayName)
      })

      function clearItems(){
        sessionStorage.removeItem("room")
        sessionStorage.removeItem("commentators")
        sessionStorage.removeItem("player2")
        sessionStorage.removeItem("player1")
        sessionStorage.removeItem("roomOwner")
      }
      console.log(this.$refs)

      function processVerdict(verdict){
      let obj = {winnerId: null, winnerName: null, loserId: null, loserName: null, verdictText: null}
      let winnerId;
      let winnerName;
      let loserId;
      let loserName;
      let verdictText;
      let winnerIdLength;
      let winnerNameLength;
      let loserIdLength;
      let loserNameLength;
      let verdictTextLength;
      let retArray = []
      let mask = 0b11111111
      let firstMask = 0b11110000
      let secondMask = 0b00001111
      //create data view for buffer
      let dv = new DataView(verdict)
      //put all of this data into an array, way easier to work with
      let array = []
      for (let i = 0; i < dv.byteLength; i++) {
          array.push(dv.getUint8(i))
      }
      //winner id
      winnerIdLength = parseInt((array[1].toString(2) + array[2].toString(2).substring(0,4)), 2) & mask
      console.log(winnerIdLength)
      let offset = 0;
      let winnerIdArray = []
      for(let i=8;i<winnerIdLength + 8; i++){
          winnerIdArray.push(array[i])
      }
      offset += winnerIdLength
      console.log(String.fromCharCode(...winnerIdArray))
      retArray.push(String.fromCharCode(...winnerIdArray))
      
      //winner name
      winnerNameLength = parseInt(array[2].toString(2).substring(4) + array[3].toString(2), 2) & mask
      console.log(winnerNameLength)
      let winnerNameArray = []
      for(let i=8 + offset;i<winnerNameLength + 8 +offset; i++){
          winnerNameArray.push(array[i])
      }
      offset += winnerNameLength;
      console.log(String.fromCharCode(...winnerNameArray))
      retArray.push(String.fromCharCode(...winnerNameArray))

      //loser id
      loserIdLength = parseInt((array[4].toString(2) + array[5].toString(2).substring(0,4)), 2) & mask
      console.log(loserIdLength)
      //offset = 0;
      let loserIdArray = []
      for(let i=8 + offset;i<loserIdLength + 8 + offset; i++){
          loserIdArray.push(array[i])
      }
      offset += loserIdLength
      console.log(String.fromCharCode(...loserIdArray))
      retArray.push(String.fromCharCode(...loserIdArray))

      //loser name
      loserNameLength = parseInt(array[5].toString(2).substring(4) + array[6].toString(2), 2) & mask
      console.log(loserNameLength)
      let loserNameArray = []
      for(let i=8 + offset;i<loserNameLength + 8 +offset; i++){
          loserNameArray.push(array[i])
      }
      offset += loserNameLength;
      console.log(String.fromCharCode(...loserNameArray))
      retArray.push(String.fromCharCode(...loserNameArray))

      //verdict text
      let mask8 = 0b11111111
      verdictTextLength = parseInt(array[7].toString(2), 2) & mask8
      console.log(verdictTextLength)
      let verdictTextArray = []
      for(let i=8 + offset;i<verdictTextLength + 8 +offset; i++){
          verdictTextArray.push(array[i])
      }
      console.log(String.fromCharCode(...verdictTextArray))
      retArray.push(String.fromCharCode(...verdictTextArray))

      console.log(retArray)
      return retArray;
    }
    },
    mounted() {
      if(sessionStorage.getItem("roomTour") == "false"){
        vueTour.removeStep("1")
        vueTour.removeStep("2")
        vueTour.removeStep("3")
        vueTour.addStep({
              id: '1',
              attachTo: { element: this.$refs.select, on: 'right' },
              text: 'This is where you select your move. Selected move will appear above.',
              classes: 'rounded-xl bg-white p-5 m-5 w-1/6 h-1/6',
              buttons: [
                {
                  text: 'Next',
                  action: vueTour.next,
                  classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
                }
              ]
            });
            vueTour.addStep({
              id: '2',
              attachTo: { element: this.$refs.text, on: 'bottom' },
              text: 'You can enter comments to send to your opponenent here',
              classes: 'rounded-xl bg-white p-5 m-5 w-1/6 h-1/6',
              buttons: [
                {
                  text: 'Next',
                  action: vueTour.next,
                  classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
                }
              ]
            });
            vueTour.addStep({
              id: '3',
              attachTo: { element: this.$refs.sb, on: 'bottom' },
              text: 'Press this button to submit any text or moves!',
              classes: 'rounded-xl bg-white p-5 m-5 w-1/6 h-1/6',
              buttons: [
                {
                  text: 'Next',
                  action: vueTour.next,
                  classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
                }
              ]
            });
  
            vueTour.start();
            sessionStorage.setItem("roomTour", "true")
      }
    }
  };

  import Shepherd from 'shepherd.js';

  const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    classes: 'shepherd-theme-custom'
  }
});

const vueTour = useShepherd({
    useModalOverlay: true
  });
  

</script>