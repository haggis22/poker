import * as MutationTypes from './mutation-types';

import { UserSummary } from '@/app/players/user-summary';


export default {

    state: () => ({

        user: null as UserSummary,

    }),
    mutations: {

        [MutationTypes.innerName(MutationTypes.USER_SUMMARY)](state: any, user: UserSummary) {

            state.user = user;

        }

    },

    actions: {},

    modules: {}

}
