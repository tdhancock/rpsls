<template>
  <div id="roomsDiv" class="items-center justify-center flex flex-col bg-sky-300 rounded-3xl m-5 w-3/4 m-auto mt-5 mb-5 h-full">
    <h1 class="text-3xl p-3 text-sky-800 font-extrabold justify-left">Login or Register here!</h1>
    <input id='dispName' placeholder="Display Name (Only needed for registration)" ref="dispName" class="border-solid border-2 mt-5 border-sky-800 rounded-2xl p-3 w-1/2"/>
    <br/><br/>
    <input placeholder="Email" ref="email" class="border-solid border-2 border-sky-800 rounded-2xl p-3 w-1/2">
    <br/><br/>
    <input placeholder="Password" type="password" ref="pass" class="border-solid border-2 border-sky-800 rounded-2xl p-3 w-1/2">
    <br/><br/>
    <div class="flex flex-row w-1/2 mb-5">
      <button @click="login" class="button rounded-3xl bg-sky-800 p-3 my-3 mr-3 hover:bg-sky-500 w-full text-sky-100 hover:text-sky-100 text-2xl">Login</button>
      <button @click="createAccount" class="button rounded-3xl bg-sky-800 p-3 my-3 ml-3 hover:bg-sky-500 w-full text-sky-100 hover:text-sky-100 text-2xl">Create Account</button>
    </div>
    
  </div>
</template>

<script>
import router from '@/router';
import axios from 'axios';
import Shepherd from 'shepherd.js';
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
        sessionStorage.setItem("tour", "false")
        sessionStorage.setItem("roomTour", "false")
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
  async mounted(){
    await sessionStorage.clear()
  }
}

// const tour = new Shepherd.Tour({
//   useModalOverlay: true,
//   defaultStepOptions: {
//     classes: 'shadow-md bg-purple-dark',
//     scrollTo: true
//   }
// });

// tour.addStep({
//   id: 'example-step',
//   text: 'This step is attached to the bottom of the <code>.example-css-selector</code> element.',
//   attachTo: {
//     element: 'email',
//     on: 'right'
//   },
//   classes: 'bg-sky-800 rounded-xl p-3 text-sky-100',
//   buttons: [
//     {
//       text: 'Next',
//       action: tour.next
//     }
//   ]
// });

// tour.start();
</script>