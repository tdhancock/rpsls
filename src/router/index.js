import { createRouter, createWebHistory } from 'vue-router'
import WorldView from '../views/WorldView.vue'
import Login from '../views/login.vue'
import Room from '../views/Room.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/world',
    name: 'world',
    component: WorldView
  },
  {
    path: '/room',
    name: 'room',
    component: Room
  }
  

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
