import { createStore } from "vuex";

import lobby from './lobby';

export default createStore({

    modules: {
        lobby: {
            namespaced: true,
            ...lobby
        }
    }

});
