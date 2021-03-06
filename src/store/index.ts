import { createStore } from "vuex";
import { TableSummary } from '@/app/casino/tables/table-summary';

export default createStore({
    state: {

        count: 0,
        tables: new Array<TableSummary>()

    },
    mutations: {
        increment(state, step) {
            state.count += step;
        },
        tableSummaries(state, tables) {

            state.tables = [...tables ]
        }
    },

    actions: {},

    modules: {}
});
