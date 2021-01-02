import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect: '/table',
    },
    {
        path: "/table/:tableID",
        name: "Table",
        component: () =>
            import(/* webpackChunkName: "table" */ '../views/Table.vue')
    }

];

const router = new VueRouter({
    routes
});

export default router;
