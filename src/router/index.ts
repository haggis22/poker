import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { userState } from '@/store/user-state';

const routes: Array<RouteRecordRaw> = [

    {
        path: "/",
        redirect: { name: 'Login' }
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
                component: () => import(/* webpackChunkName: "lobby" */ '../views/lobby/Lobby.vue'),
                beforeEnter(to, from, next) {

                    if (!userState.getToken.value) {
                        next({ name: 'Login' });
                    }
                    else {
                        next();
                    }

                }
            },
            {
                path: "table/:tableID",
                name: "Table",
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import(/* webpackChunkName: "table" */ '../views/table/Table.vue'),
                props: true,
                beforeEnter(to, from, next) {

                    if (!userState.getToken.value) {
                        next({ name: 'Login' });
                    }
                    else {
                        next();
                    }

                }

            },
            {
                path: '/:pathMatch(.*)*',
                redirect: { name: 'Login' }
            }

        ]

    },


];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
