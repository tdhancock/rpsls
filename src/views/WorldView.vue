<template>
  <div id="roomsDiv" class="items-center flex flex-col bg-sky-300 rounded m-5">
    <div class="rounded bg-gray-300 m-3 flex-wrap items-center w-1/2 border-2 border-sky-500">
      <h1 class='p-3 text-lg text-[#42b983]'>{{displayName}}</h1>
      <h2 class='p-3 text-sm'>Wins: {{wins}}</h2>
      <h2 class='p-3 text-sm'>Losses: {{losses}}</h2>
    </div>
    <div class="flex flex-row w-1/2 m-3">
      <button @click="createRoom" class=" border-2 border-sky-500 button rounded bg-gray-300 p-3 w-full hover:bg-sky-500">Create Room</button>
      <button @click="refreshRooms" class="border-2 border-sky-500 button rounded bg-gray-300 p-3 w-full hover:bg-sky-500">Refresh Rooms</button>
    </div>
    <div class="m-3 w-1/2">
      <div v-for="room in rooms" class=" border-solid border-2 border-sky-500 rounded bg-gray-300 w-full">
        <p class="p-5">{{room.player1.displayName}}'s room</p>
        <input hidden="true" :ref="room.id" :placeholder="room"/>
        <button @click="joinRoom(room)" class="rounded bg-sky-300 m-3 p-3 hover:bg-sky-500" :id="room.id">Join Room!</button>
      </div>
    </div>
    
  </div>
</template>


<script>
  import router from '@/router';
  import axios from 'axios';
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
    }
  }


</script>
