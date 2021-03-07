import * as MutationTypes from './mutation-types';

import { TableSummary } from '@/app/casino/tables/table-summary';
import { UserSummary } from '@/app/players/user-summary';


export default {

    state: () => ({

        user: null as UserSummary,
        tables: new Array<TableSummary>()

    }),
    mutations: {

        [MutationTypes.innerName(MutationTypes.TABLE_SUMMARIES)](state: any, tables: Array<TableSummary>) {

            state.tables = [...tables]

        },
        [MutationTypes.innerName(MutationTypes.USER_SUMMARY)](state: any, user: UserSummary) {

            state.user = user;

        }

    },

    actions: {},

    modules: {}

}
