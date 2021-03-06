import { createStore } from "vuex";

export default createStore({
    state: {
        count: 4,

    },
    mutations: {
        increment(state, step) {
            state.count += step;
        }
    },
    actions: {},
    modules: {}
});
