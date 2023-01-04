<template>
  <body class="bg-sky-800 min-h-screen h-auto pb-5">
    <div class="items-center flex flex-col h-1/5">
      <nav class="flex bg-sky-300 rounded-3xl w-3/4 mt-5 justify-center">
        <div class="w-1/2 flex">
          <router-link to="/" class="bg-sky-800 p-3 rounded-3xl mr-2 hover:text-sky-100 hover:bg-sky-500 w-1/3">Login</router-link> 
          <router-link to="/world" class="bg-sky-800 p-3 rounded-3xl mx-2 hover:text-sky-100 hover:bg-sky-500 w-1/3">World View</router-link>
          <router-link to="/room" class="bg-sky-800 p-3 rounded-3xl ml-2 hover:text-sky-100 hover:bg-sky-500 w-1/3">Room</router-link>
        </div>
      </nav>
    </div>
    <div class="h-3/5">
      <router-view/>
    </div>
  </body>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: rgb(125 211 252);
  font-size: xx-large;
}

nav a.router-link-exact-active {
  color: rgb(224 242 254);
}

</style>
