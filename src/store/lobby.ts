import { TableSummary } from '@/app/casino/tables/table-summary';

export default {

    state: () => ({

        tables: new Array<TableSummary>()

    }),
    mutations: {

        tableSummaries(state: any, tables: Array<TableSummary>) {

            state.tables = [...tables]

        }

    },

    actions: {},

    modules: {}
}
