import { reactive, computed } from "vue";

import { UserSummary } from '@/app/players/user-summary';
import { GameClient } from '@/app/communication/client-side/game-client';
import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
import { RouteLocationRaw } from 'vue-router';


const state = reactive({

    gameClient: null as GameClient,

    token: null as string,

    isAuthenticated: null as boolean,

    user: null as UserSummary,

    chipFormatter: null as IChipFormatter,
    balance: null as number,

    loginErrorMessage: null as string,

});


const getGameClient = computed((): GameClient => state.gameClient);

const setGameClient = (client: GameClient): void => {

    state.gameClient = client;

}

const isAuthenticated = computed((): boolean => state.isAuthenticated);

const setAuthentication = (user: UserSummary, authToken: string): void => {

    state.user = user;
    state.token = authToken;
    state.isAuthenticated = true;

}

const clearAuthentication = (): void => {

    state.user = null;
    state.token = null;
    state.isAuthenticated = false;

}

const getToken = computed((): string => state.token);

const getUser = computed((): UserSummary => state.user);

const getUserID = computed((): number => state.user ? state.user.id : null);


const getChipFormatter = computed(() => state.chipFormatter);
const setChipFormatter = (formatter: IChipFormatter): void => {

    state.chipFormatter = formatter;

}

const getBalance = computed((): number => state.balance);

const setBalance = (balance: number): void => {
    state.balance = balance;
};


const getLoginErrorMessage = computed((): string => state.loginErrorMessage);

const setLoginErrorMessage = (message: string): void => {

    state.loginErrorMessage = message;

};



export const userState = {

    getGameClient,
    setGameClient,

    isAuthenticated,

    getToken,
    getUser,
    getUserID,

    setAuthentication,
    clearAuthentication,

    getChipFormatter,
    setChipFormatter,
    getBalance,
    setBalance,

    getLoginErrorMessage,
    setLoginErrorMessage,

};
