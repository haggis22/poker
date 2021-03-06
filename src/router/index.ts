import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [

    {
        path: "/",
        redirect: '/lobby',
    },
    {
        path: "/lobby",
        name: "Lobby",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "lobby" */ '../views/lobby/Lobby.vue')
    },
    {
        path: "/table/:tableID",
        name: "Table",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "table" */ '../views/table/Table.vue')
    }

];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
