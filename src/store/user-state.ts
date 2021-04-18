import { reactive, computed } from "vue";

import { UserSummary } from '@/app/players/user-summary';
import { GameClient } from '@/app/communication/client-side/game-client';
import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';

const STORAGE_KEY_NAME: string = 'session-token';


const state = reactive({

    gameClient: null as GameClient,

    token: localStorage.getItem(STORAGE_KEY_NAME),

    user: null as UserSummary,

    chipFormatter: null as IChipFormatter,
    balance: null as number,

    loginErrorMessage: null as string,

    isConnected: false

});


const getGameClient = computed((): GameClient => state.gameClient);

const setGameClient = (client: GameClient): void => {

    state.gameClient = client;

}

const setAuthentication = (user: UserSummary, authToken: string): void => {

    setUser(user);
    setToken(authToken);

};

const clearAuthentication = (): void => {

    setUser(null);
    setToken(null);

}

const getToken = computed((): string => state.token);

const setToken = (authToken: string) => {

    if (authToken != null) {

        localStorage.setItem(STORAGE_KEY_NAME, authToken);

    }
    else {

        localStorage.removeItem(STORAGE_KEY_NAME);

    }

    state.token = authToken;

};

const getUser = computed((): UserSummary => state.user);

const setUser = (user: UserSummary): void => {

    state.user = user;

}

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

const isConnected = computed((): boolean => state.isConnected);

const setConnected = (isConnected: boolean): void => {

    state.isConnected = isConnected;

}


export const userState = {

    getGameClient,
    setGameClient,

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

    isConnected,
    setConnected

};
