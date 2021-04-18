import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [

    {
        path: "/",
        redirect: '/casino/login',
    },
    {
        path: "/casino",
        name: "Casino",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "casino" */ '../views/casino/Casino.vue'),

        children: [

            {
                path: "login",
                name: "Login",
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "login" */ '../views/login/Login.vue')
            },
            {
                path: "lobby",
                name: "Lobby",
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "lobby" */ '../views/lobby/Lobby.vue')
            },
            {
                path: "table/:tableID",
                name: "Table",
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "table" */ '../views/table/Table.vue'),
                props: true
            }

        ]

    },


];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
