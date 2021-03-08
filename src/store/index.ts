import { createStore } from "vuex";

import table from './table/table';

export default createStore({

    modules: {
        table: {
            namespaced: true,
            ...table
        }
    }

});
