import { reactive, computed } from "vue";

import { UserSummary } from '@/app/players/user-summary';


const state = reactive({

    token: null as string,

    isAuthenticated: null as boolean,

    user: null as UserSummary,
    balance: null as number,

    loginErrorMessage: null as string

});


const getToken = computed((): string => state.token);


const isAuthenticated = computed((): boolean => state.token != null);

const setAuthenticated = (user: UserSummary, authToken: string): void => {

    state.user = user;
    state.token = authToken;

}


const getUser = computed((): UserSummary => state.user);

const getUserID = computed((): number => state.user ? state.user.id : null);


const getBalance = computed((): number => state.balance);

const setBalance = (balance: number): void => {
    state.balance = balance;
};


const getLoginErrorMessage = computed((): string => state.loginErrorMessage);

const setLoginErrorMessage = (message: string): void => {

    state.loginErrorMessage = message;

};


const logOut = (): void => {

    setAuthenticated(null, null);

}


export const userState = {

    isAuthenticated,

    getToken,
    getUser,
    getUserID,

    setAuthenticated,

    getBalance,
    setBalance,

    getLoginErrorMessage,
    setLoginErrorMessage,

    logOut

};
