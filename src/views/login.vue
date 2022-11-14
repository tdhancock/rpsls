<template>
  <div id="roomsDiv" class="items-center flex flex-col bg-sky-300 rounded m-5">
    <!-- <h1>Login</h1> -->
    <h2 class="text-xl pt-5 m-3">Display Name (Only needed for registration)</h2>
    <input placeholder="Enter Name" ref="dispName" class="border-solid border-2 border-sky-500 rounded p-3 w-1/3"/>
    <br/><br/>
    <p class="text-xl m-1 text-left">Email</p>
    <input placeholder="Enter Email" ref="email" class="border-solid border-2 border-sky-500 rounded p-3 w-1/3">
    <br/><br/>
    <h2 class="text-xl m-1">Password</h2>
    <input placeholder="Enter Password" type="password" ref="pass" class="border-solid border-2 border-sky-500 rounded p-3 w-1/3">
    <br/><br/>
    <div class="flex-row">

      <button @click="login" class="button rounded bg-gray-300 p-3 m-3 hover:bg-sky-500 border-2 border-sky-500">Login</button>
      <button @click="createAccount" class="button rounded bg-gray-300 p-3 m-3 hover:bg-sky-500 border-2 border-sky-500">Create Account</button>
    </div>
    
  </div>
</template>

<script>
import router from '@/router';
import axios from 'axios';
export default {
  name: 'Login',
  components: {
  },
  data() {
    return{
    }
  },
  methods: {
    //Methods to login and create new account
    async login() {
      //clear if they wanted to log in with a new account
      sessionStorage.clear()
      //Check for user in db
      let res = await axios.post('http://localhost:3000/api/login', {
        password: this.$refs.pass.value,
        email: this.$refs.email.value,
      })
      //check good data
      if(res.data.success){
        //add user to local storage
        let player = res.data.data.player
        console.log(player)
        sessionStorage.setItem("id", player._id);
        sessionStorage.setItem("displayName", player.displayName);
        sessionStorage.setItem("wins", player.wins);
        sessionStorage.setItem("email", player.email)
        sessionStorage.setItem("losses", player.losses);
        //Automatically move on to the rooms page
        router.push({name: 'world'})
      }else{
        alert("No user with these credentials")
      }
       
    },
    async createAccount(){
      sessionStorage.clear()
      //Create a new account
      let res = await axios.post('http://localhost:3000/api/register', {
        displayName: this.$refs.dispName.value,
        password: this.$refs.pass.value,
        email: this.$refs.email.value
      })
      console.log(res.data.data.id);
      sessionStorage.setItem("id", res.data.data.id);
      sessionStorage.setItem("displayName", this.$refs.dispName.value);
      sessionStorage.setItem("wins", 0);
      sessionStorage.setItem("email", this.$refs.email.value)
      await sessionStorage.setItem("losses", 0);
      router.push({name: 'world'})
    }
  },
  mounted(){
    sessionStorage.clear()
  }
}
</script>