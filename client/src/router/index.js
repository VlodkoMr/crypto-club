import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import NotFound from '@/views/NotFound';

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about-club',
        name: 'AboutClub',
        component: () => import('../views/AboutClub.vue')
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: () => import('../views/Privacy.vue')
    },
    {
        path: '/rules',
        name: 'Rules',
        component: () => import('../views/Rules.vue')
    },
    {
        path: '/room/:id',
        name: 'OneRoom',
        component: () => import('../views/OneRoom.vue')
    },
    {
        path: '/my-predictions',
        name: 'MyPredictions',
        component: () => import('../views/MyPredictions.vue')
    },
    {path: '/404', component: NotFound},
    {path: '*', redirect: '/404'},
]

const index = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default index
