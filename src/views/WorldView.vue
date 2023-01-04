<template>
  <div id="roomsDiv" class="items-center justify-center flex flex-col bg-sky-300 rounded-3xl m-5 w-3/4 m-auto mt-5 mb-5 h-auto">
    <div class="flex flex-row justify-center w-1/2 mt-3">
      <div ref='info' class="flex rounded-3xl bg-white m-3 flex-wrap items-center justify-center border-2 border-sky-800 p-3 w-3/5">
        <h1 class='p-3 text-3xl text-sky-800'>{{displayName}}</h1>
        <h2 class='p-3 text-lg'>Wins: {{wins}}</h2>
        <h2 class='p-3 text-lg'>Losses: {{losses}}</h2>
      </div>
      <div class="flex flex-col w-2/5">
        <button ref='cr' @click="createRoom" class="button rounded-3xl bg-sky-800 p-3 m-3 hover:bg-sky-500 text-sky-100 hover:text-sky-100 text-2xl">Create Room</button>
        <button ref='rr' @click="refreshRooms" class="button rounded-3xl bg-sky-800 p-3 m-3 hover:bg-sky-500 text-sky-100 hover:text-sky-100 text-2xl">Refresh Rooms</button>
      </div>
    </div>
    <div class="m-3 w-1/2">
      <div v-for="room in rooms" class="flex flex-col rounded-3xl bg-white m-3 flex-wrap items-center w-auto border-2 border-sky-800 p-3 justify-evenly">
        
        <div class="w-1/2">
          <p class='p-3 text-2xl text-sky-800'>{{room.player1.displayName}}'s room</p>
        </div>

        <div class="w-1/2">

          <button @click="joinRoom(room)" class="button rounded-3xl bg-sky-800 p-3 m-3 hover:bg-sky-500 text-sky-100 hover:text-sky-100 text-2xl w-full" :id="room.id">Join Room!</button>
        </div>

      </div>
    </div>
    
  </div>
</template>


<script>
  import router from '@/router';
  import axios from 'axios';
  import { useShepherd } from 'vue-shepherd'
  import { ref, onMounted } from 'vue'
  export default {
    name: 'WorldView',
    data() {
      return {
        rooms: [],
        displayName: sessionStorage.getItem("displayName"),
        wins: sessionStorage.getItem("wins"),
        losses: sessionStorage.getItem("losses")
      }
    },
    methods: {
      async createRoom() {
        let Player = {id: sessionStorage.getItem("id"), 
        displayName: sessionStorage.getItem("displayName"),
        wins: sessionStorage.getItem("wins"),
        losses: sessionStorage.getItem("losses")}
        let res = await axios.post('http://localhost:3000/api/game', Player);
        sessionStorage.setItem("room", sessionStorage.getItem("id"))
        sessionStorage.setItem("player1", sessionStorage.getItem("id"))
        sessionStorage.setItem("player2",null)
        sessionStorage.setItem("commentators", [])
        sessionStorage.setItem("roomOwner", sessionStorage.getItem("displayName"))
        this.refreshRooms()
        router.push({name: 'room'})
      },
      async refreshRooms(){
        let res = await axios({
        method: 'get',
        url: 'http://localhost:3000/api/game'
        });
        let newRooms = await res.data.data
        console.log(newRooms);
        this.rooms = newRooms;
      },
      async joinRoom(roomObj){
        console.log(roomObj)
        let Player = {id: sessionStorage.getItem("id"), 
        displayName: sessionStorage.getItem("displayName"),
        wins: sessionStorage.getItem("wins"),
        losses: sessionStorage.getItem("losses")}
        let res = await axios.put('http://localhost:3000/api/game/join', {
        player: Player,
        room: roomObj
        })
        sessionStorage.setItem("room", roomObj.id)
        sessionStorage.setItem("player1", roomObj.player1.id)
        sessionStorage.setItem("player2", Player.id)
        sessionStorage.setItem("commentators", roomObj.commentators)
        sessionStorage.setItem("roomOwner",roomObj.player1.displayName)
        router.push({name: 'room'})
      }
    },
    async mounted() {
      //console.log(player)
      let res = await axios({
        method: 'get',
        url: 'http://localhost:3000/api/game'
        });
        let newRooms = await res.data.data
        console.log(newRooms)
        // console.log(newRooms[2].player1.displayName);
        this.rooms = newRooms;

        if(sessionStorage.getItem("tour") == "false"){
          tour.removeStep("curr-step1")
          tour.removeStep("curr-step2")
          tour.removeStep("curr-step3")
          tour.addStep({
            id: 'curr-step1',
            attachTo: { element: this.$refs.info, on: 'bottom' },
            text: 'This is your username and win/loss ratio. This will update after every game that you play.',
            classes: 'rounded-xl bg-white p-5 m-5 w-1/6 h-1/6',
            buttons: [
              {
                text: 'Next',
                action: tour.next,
                classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
              }
            ]
          });
          tour.addStep({
            id: 'curr-step2',
            attachTo: { element: this.$refs.cr, on: 'bottom' },
            text: 'This button allows you to create a new room. Other players can join you to play a game!',
            classes: 'rounded-xl bg-white p-5 m-5 w-1/6 h-1/6',
            buttons: [
              {
                text: 'Next',
                action: tour.next,
                classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
              }
            ]
          });
          tour.addStep({
            id: 'curr-step3',
            attachTo: { element: this.$refs.rr, on: 'bottom' },
            text: 'This button allows you to see already existing games!',
            classes: 'rounded-xl bg-white p-5 m-5 w-1/6 h-1/6',
            buttons: [
              {
                text: 'Next',
                action: tour.next,
                classes: 'bg-sky-800 rounded-xl p-5 m-5 hover:bg-sky-300 hover:text-sky-800 fixed bottom-0 right-0'
              }
            ]
          });
  
          tour.start();
          sessionStorage.setItem("tour", "true")
        }
        

      }
  }
    const tour = useShepherd({
    useModalOverlay: true
  });


</script>
