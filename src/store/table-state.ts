import { ref, reactive, computed } from "vue";

import { Table } from '@/app/casino/tables/table';
import { Game } from '@/app/games/game';
import { Player } from '@/app/players/player';
import { Seat } from '@/app/casino/tables/seat';
import { Timer } from '@/app/timers/timer';


const state = ref({

    table: null as Table,
    game: null as Game,
    messages: [] as string[],

    seatActions: new Map<number, string>(),
    seatTimers: new Map<number, Timer>()

});


const getTable = computed((): Table => state.value.table);

const setTable = (table: Table): void => {
    state.value.table = table;
};

const getGame = computed(() => state.value.game);

const setGame = (game: Game): void => {
    state.value.game = game;
}

const getMessages = computed(() => state.value.messages);

const addMessage = (message: string): void => {

    state.value.messages.push(message);

}

const setPlayer = (seatIndex: number, player: Player): boolean => {

    state.value.table.seats[0].player.name = "Matthew";

    if (seatIndex >= 0 && seatIndex < state.value.table.seats.length) {

        state.value.table.seats[seatIndex].player = player;

        return true;

    }

    return false;

}

const getActions = computed((): Map<number, string> => state.value.seatActions);

const setAction = (seatIndex: number, action: string): void => {

    state.value.seatActions.set(seatIndex, action);

};

const clearAction = (seatIndex: number): void => {

    state.value.seatActions.delete(seatIndex);

}

const clearActions = (): void => {

    state.value.seatActions.clear();

}

const getTimers = computed((): Map<number, Timer> => state.value.seatTimers);


const startTimer = (seatIndex: number, timer: Timer): void => {

    clearTimer(seatIndex);

    const reactiveTimer = reactive(timer);

    reactiveTimer.timer = setTimeout(() => { stepDownTimer(reactiveTimer); }, Timer.STEP_TIME);
    state.value.seatTimers.set(seatIndex, reactiveTimer);

};

function stepDownTimer(timer: Timer): void {

    clearTimeout(timer.timer);

    if (timer.totalTime > 0) {

        const timeRemaining = Math.max(timer.expireTime - Date.now(), 0);

        if (timeRemaining > 0) {

            timer.percentRemaining = 100 * (timeRemaining / timer.totalTime)
            timer.timer = setTimeout(() => {
                stepDownTimer(timer);
            }, Timer.STEP_TIME);

        }
        else {
            timer.percentRemaining = 0;
        }

    }
    else {
        timer.percentRemaining = 0;
    }

}  // stepDownTimer


const clearTimer = (seatIndex: number): void => {


    let timer: Timer = getTimers.value.get(seatIndex);
    if (timer) {

        clearTimeout(timer.timer);

    }

    state.value.seatTimers.delete(seatIndex);

}

const clearTimers = (): void => {

    // Stop any seat timer that is already running
    for (let [seatIndex, timer] of getTimers.value) {

        if (timer) {
            clearTimer(seatIndex);
        }

    }

    state.value.seatTimers.clear();

}


export const tableState = {

    getTable,
    setTable,

    getGame,
    setGame,

    getMessages,
    addMessage,

    setPlayer,

    getActions,
    setAction,
    clearAction,
    clearActions,

    getTimers,
    startTimer,
    clearTimer,
    clearTimers

};

