import { reactive, computed } from "vue";

import { UserSummary } from '@/app/players/user-summary';


const state = reactive({

    user: null as UserSummary,
    balance: null as number

});


const getUser = computed((): UserSummary => state.user);

const setUser = (user: UserSummary): void => {
    state.user = user;
};

const getBalance = computed((): number => state.balance);

const setBalance = (balance: number): void => {
    state.balance = balance;
};


export const userState = {

    getUser,
    setUser,

    getBalance,
    setBalance

};
