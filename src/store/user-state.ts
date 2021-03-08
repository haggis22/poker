import { reactive, computed } from "vue";

import { UserSummary } from '@/app/players/user-summary';


const state = reactive({

    user: null as UserSummary

});


const getUser = computed((): UserSummary => state.user);

const setUser = (user: UserSummary): void => {
    state.user = user;
};


export const userState = {

    getUser,
    setUser

};
