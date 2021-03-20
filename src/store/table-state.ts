import { ref, toRefs, reactive, computed } from "vue";

import { Table } from '@/app/casino/tables/table';
import { Game } from '@/app/games/game';
import { Player } from '@/app/players/player';
import { Seat } from '@/app/casino/tables/seat';
import { Timer } from '@/app/timers/timer';


const state = reactive({

    table: null as Table,
    game: null as Game,
    messages: [] as string[],

    seatActions: new Map<number, string>(),
    seatTimers: new Map<number, Timer>()

});


const getTable = computed((): Table => state.table);

const setTable = (table: Table): void => {
    state.table = table;
};

const getGame = computed(() => state.game);

const setGame = (game: Game): void => {
    state.game = game;
}

const getMessages = computed(() => state.messages);

const addMessage = (message: string): void => {

    state.messages.push(message);

}

const getSeat = (seatIndex: number): Seat => {

    const table: Table = getTable.value;

    return table?.seats[seatIndex];

};

const getPlayer = (seatIndex: number): Player => {

    const table: Table = getTable.value;

    const seat = table?.seats[seatIndex];
    
    return seat.player;

};


const setPlayer = (seatIndex: number, player: Player): boolean => {

    let mattSeat: Seat = getSeat(0);
    if (mattSeat) {
        mattSeat.player.name = "Matthew";
        mattSeat.player = player;
    }

    let seat: Seat = getSeat(seatIndex);

    if (seat) {

        seat.player = player;
        return true;

    }

    return false;

}

const getActions = computed((): Map<number, string> => state.seatActions);

const setAction = (seatIndex: number, action: string): void => {

    state.seatActions.set(seatIndex, action);

};

const clearAction = (seatIndex: number): void => {

    state.seatActions.delete(seatIndex);

}

const clearActions = (): void => {

    state.seatActions.clear();

}

const getTimers = computed((): Map<number, Timer> => state.seatTimers);


const startTimer = (seatIndex: number, timer: Timer): void => {

    clearTimer(seatIndex);

    const reactiveTimer = reactive(timer);

    reactiveTimer.timer = setTimeout(() => { stepDownTimer(reactiveTimer); }, Timer.STEP_TIME);
    state.seatTimers.set(seatIndex, reactiveTimer);

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

    state.seatTimers.delete(seatIndex);

}

const clearTimers = (): void => {

    // Stop any seat timer that is already running
    for (let [seatIndex, timer] of getTimers.value) {

        if (timer) {
            clearTimer(seatIndex);
        }

    }

    state.seatTimers.clear();

}


export const tableState = {

    getTable,
    setTable,

    getGame,
    setGame,

    getMessages,
    addMessage,

    getSeat,

    getPlayer,
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

