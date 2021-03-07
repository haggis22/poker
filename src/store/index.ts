import { createStore } from "vuex";

import lobby from './lobby/lobby';
import table from './table/table';

export default createStore({

    modules: {
        lobby: {
            namespaced: true,
            ...lobby
        },
        table: {
            namespaced: true,
            ...table
        }
    }

});
