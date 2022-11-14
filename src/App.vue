<template>
  <body class="">
    <nav class="bg-sky-300 rounded m-5">
      <router-link to="/">Login</router-link> |
      <router-link to="/world">World View</router-link> |
      <router-link to="/room">Room</router-link>
    </nav>
    <router-view/>
  </body>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: rgb(14 165 233);
}
</style>
