import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect: '/table',
    },
    {
        path: "/lobby",
        name: "Lobby",
        component: () =>
            import(/* webpackChunkName: "lobby" */ '../lobby/Lobby.vue')
    },
    {
        path: "/table/:tableID",
        name: "Table",
        component: () =>
            import(/* webpackChunkName: "table" */ '../table/Table.vue')
    }

];

const router = new VueRouter({
    routes
});

export default router;
