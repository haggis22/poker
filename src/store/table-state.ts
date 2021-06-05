import { ref, toRefs, reactive, computed } from "vue";

import { Table } from '@/app/casino/tables/table';
import { Game } from '@/app/games/game';
import { Player } from '@/app/players/player';
import { Seat } from '@/app/casino/tables/seat';
import { Timer } from '@/app/timers/timer';
import { TableState } from '@/app/casino/tables/states/table-state';
import { AnteCommand } from '@/app/commands/table/betting/ante-command';
import { BetCommand } from '@/app/commands/table/betting/bet-command';
import { FoldCommand } from '@/app/commands/table/betting/fold-command';
import { Bet } from '@/app/casino/tables/betting/bet';
import { BetStatus } from '@/app/casino/tables/betting/bet-status';
import { Card } from '@/app/cards/card';
import { FacedownCard } from '@/app/cards/face-down-card';
import { Hand } from '@/app/hands/hand';
import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
import { WonPot } from '@/app/casino/tables/betting/won-pot';
import { UIPosition } from '@/app/ui/ui-position';
import { BettingCommand } from '@/app/commands/table/betting/betting-command';
import { betController } from '@/app/casino/tables/betting/bet-controller';
import { userState } from './user-state';


const state = reactive({

    tableID: null as number,
    chipFormatter: null as IChipFormatter,

    table: null as Table,
    game: null as Game,
    messages: [] as string[],

    mySeatIndex: null as number,

    seatTimers: new Map<number, ReturnType<typeof setTimeout>>(),

    // fields specific to acting in advance
    pendingBetCommand: null as BettingCommand,
    pendingBetNumRaises: null as number,

    myCall: null as Bet,
    myMinRaise: null as Bet,
    myMaxRaise: null as Bet,

    currentBalance: null as number,

    showdownRequired: false,
    winningHand: null as string,

    wonPots: [] as WonPot[],

    // indicates which cards were used in calculating the winning hand for a given pot
    usedCards: [] as Card[],

    gatheringAntes: false,
    gatheringBets: false,

    dealerPositions: new Map<number, UIPosition>(),
    playerPositions: new Map<number, UIPosition>(),

    localSittingOut: undefined as boolean,
    hasPendingStatusRequest: false

});


const initialize = () =>
{
    state.tableID = null;

    state.chipFormatter = null;

    state.table = null;
    state.game = null;
    state.messages.length = 0;

    state.mySeatIndex = null;

    state.seatTimers.clear();

    // fields specific to acting in advance
    state.pendingBetCommand = null;
    state.pendingBetNumRaises = null;

    state.myCall = null;
    state.myMinRaise = null;
    state.myMaxRaise = null;

    state.currentBalance = null;

    state.showdownRequired = false;
    state.winningHand = null;

    state.wonPots.length = 0;

    state.usedCards.length = 0;

    state.gatheringAntes = false;
    state.gatheringBets = false;

    state.dealerPositions.clear();
    
    state.playerPositions.clear();

    state.localSittingOut = undefined;
    state.hasPendingStatusRequest = false;


};


const getTableID = computed((): number => state.tableID);

const setTableID = (tableID: number) => { state.tableID = tableID; };

const getTable = computed((): Table => state.table);

const setTable = (table: Table): void => {
    state.table = table;
};

const setTableState = (tableState: TableState): void => {

    state.table.state = tableState;

};

const getChipFormatter = computed(() => state.chipFormatter);

const setChipFormatter = (formatter: IChipFormatter): void => {

    state.chipFormatter = formatter;

}


const getGame = computed(() => state.game);

const setGame = (game: Game): void => {
    state.game = game;
}

const getMessages = computed(() => state.messages);

const addMessage = (message: string): void => {

    state.messages.push(message);

}

const getMySeatIndex = computed(() => state.mySeatIndex);

const setMySeatIndex = (seatIndex: number): void => {

    state.mySeatIndex = seatIndex;

}

const getMySeat = computed(() => getMySeatIndex.value == null ? null : state.table.seats[getMySeatIndex.value]);


const getPlayer = (seatIndex: number): Player => {

    const table: Table = getTable.value;

    const seat = table?.seats[seatIndex];
    
    return table?.seats[seatIndex].player;

};


const setPlayer = (seatIndex: number, player: Player): boolean => {

    let seat: Seat = state.table.seats[seatIndex];

    if (seat) {

        seat.player = player;
        return true;

    }

    return false;

}

const setPlayerStatus = (userID: number, isSittingOut: boolean): boolean => {

    for (let seat of state.table.seats) {

        if (seat.player?.userID === userID) {

            seat.player.isSittingOut = isSittingOut;
            return true;

        }

    }

    return false;

}   // setPlayerStatus


const setPlayerChips = (playerID: number, chips: number): boolean => {

    for (let seat of state.table.seats) {

        if (seat.player?.userID === playerID) {

            seat.player.chips = chips;
            return true;

        }

    }

    return false;

}  // setPlayerChips


const setIsInHand = (seatIndex: number, isInHand: boolean): boolean => {

    let seat: Seat = state.table.seats[seatIndex];
    
    if (seat) {
        seat.isInHand = isInHand;
        return true;
    }

    return false;

}  // setIsInHand


const setAction = (seatIndex: number, action: string): void => {

    let seat: Seat = state.table.seats[seatIndex];

    if (seat) {
        seat.action = action;
    }

};


const clearActions = (): void => {

    for (let seat of state.table.seats) {

        seat.action = null;

    }

}


const startTimer = (seatIndex: number, timer: Timer): void => {

    clearTimer(seatIndex);

    const reactiveTimer = reactive(timer);

    let timerID: ReturnType<typeof setTimeout> = setTimeout(() => { stepDownTimer(seatIndex, reactiveTimer); }, Timer.STEP_TIME);

    // Remember the timerID in the map so that we can stop it later
    state.seatTimers.set(seatIndex, timerID);

    const seat: Seat = state.table.seats[seatIndex];
    if (seat) {

        seat.timer = reactiveTimer;

    }
};

function stepDownTimer(seatIndex: number, timer: Timer): void {

    const oldTimerID: ReturnType<typeof setTimeout> = state.seatTimers.get(seatIndex);

    if (oldTimerID != null) {

        clearTimeout(oldTimerID);

    }

    if (timer.totalTime > 0) {

        const timeRemaining = Math.max(timer.expireTime - Date.now(), 0);

        if (timeRemaining > 0) {

            timer.percentRemaining = 100 * (timeRemaining / timer.totalTime);

            const newTimerID: ReturnType<typeof setTimeout> = setTimeout(() => { stepDownTimer(seatIndex, timer); }, Timer.STEP_TIME);

            state.seatTimers.set(seatIndex, newTimerID);

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

    let timerID: ReturnType<typeof setTimeout> = state.seatTimers.get(seatIndex);

    if (timerID) {

        clearTimeout(timerID);

    }

    // This doesn't throw an error, even if the seatIndex is not in the map
    state.seatTimers.delete(seatIndex);

    const seat: Seat = state.table.seats[seatIndex];
    if (seat) {

        seat.timer = null;

    }

}

const clearTimers = (): void => {

    // Stop any seat timer that is already running
    for (const seatIndex of state.seatTimers.keys()) {
        clearTimer(seatIndex);
    }

}

const getPendingBetCommand = computed((): BettingCommand => state.pendingBetCommand);

const setPendingBetCommand = (command: BettingCommand): void => {

    state.pendingBetCommand = command;

};

const getPendingBetNumRaises = computed(() => state.pendingBetNumRaises);

const setPendingBetNumRaises = (numRaises: number): void => {

    state.pendingBetNumRaises = numRaises;
};

const clearPendingBetCommands = (): void => {

    setPendingBetCommand(null);
    setPendingBetNumRaises(null);

};


const getMyCall = computed(() => {

    if (getMySeat.value != null && userState.getUserID.value != null) {

        return betController.calculateCall(state.table, getMySeat.value, userState.getUserID.value);

    }

    return null;

});

const getMyMinRaise = computed(() => {

    if (getMySeat.value != null && userState.getUserID.value != null) {

        return betController.calculateMinimumRaise(state.table, getMySeat.value, userState.getUserID.value, getMyCall.value);

    }

    return null;

});

const getMyMaxRaise = computed(() => {

    if (getMySeat.value != null && userState.getUserID.value != null) {

        return betController.calculateMaximumRaise(state.table, getMySeat.value, userState.getUserID.value, getMyCall.value);

    }

    return null;

});


const getBetStatus = computed(() => state.table?.betStatus);

const setBetStatus = (status: BetStatus): void => {

    state.table.betStatus = status;

};

const setButtonIndex = (seatIndex: number): void => {

    state.table.buttonIndex = seatIndex;

};

const dealCard = (seatIndex: number, card: Card | FacedownCard): void => {

    state.table.seats[seatIndex].deal(card);

};

const setHand = (seatIndex: number, hand: Hand): void => {

    state.table.seats[seatIndex].hand = hand;
    
};

const clearHand = (seatIndex: number): (Card | FacedownCard)[] => {

    return state.table.seats[seatIndex].clearHand();

};

const setMuckedCards = (seatIndex: number, cards: (Card | FacedownCard)[]): void => {

    state.table.seats[seatIndex].muckedCards = [ ...cards ];

};

const clearMuckedCards = (): void => {

    for (const seat of state.table.seats) {
        seat.muckedCards.length = 0;
    }

};


const dealBoard = (cards: Card[]): void => {

    for (let card of cards) {

        state.table.board.deal(card);

    }

};

const clearBoard = (): void => {

    state.table.board.reset();

};

const getCurrentBalance = computed((): number => state.currentBalance);
const setCurrentBalance = (balance: number) => {

    state.currentBalance = balance;

};

const getShowdownRequired = computed((): boolean => state.showdownRequired);
const setShowdownRequired = (isShowdownRequired: boolean) => {

    state.showdownRequired = isShowdownRequired;

};

const getWinningHand = computed((): string => state.winningHand);
const setWinningHand = (winner: string) => {

    state.winningHand = winner;

}

const clearUsedCards = () => {

    state.usedCards.length = 0;

};

const setUsedCards = (cards: Card[]): void => {

    state.usedCards = [...cards];


};

const isCardUsed = (card: Card | FacedownCard) => {

    // Has to be a face-up Card in order to be used
    return card instanceof Card && state.usedCards.find(usedCard => usedCard.equals(card)) != null;

};

const getGatheringAntes = computed(() => state.gatheringAntes);
const setGatheringAntes = (isGatheringAntes: boolean): void => {

    state.gatheringAntes = isGatheringAntes;

};

const getGatheringBets = computed(() => state.gatheringBets);
const setGatheringBets = (isGatheringBets: boolean): void => {

    state.gatheringBets = isGatheringBets;

};

const getWonPots = computed((): WonPot[] => state.wonPots);

const clearWonPots = (): void => {

    state.wonPots.length = 0;

};

const addWonPot = (pot: WonPot) => {

    state.wonPots.push(pot);

};


const getDealerPosition = (seatIndex: number) => {

    return state.dealerPositions.get(seatIndex);

};

const setDealerPositions = (positions: Map<number, UIPosition>) => {

    state.dealerPositions = positions;

};

const getPlayerPosition = (seatIndex: number) => {

    return state.playerPositions.get(seatIndex);

};

const setPlayerPositions = (positions: Map<number, UIPosition>) => {

    state.playerPositions = positions;

};


const getLocalSittingOut = computed((): boolean => {

    return state.localSittingOut;

});

const setLocalSittingOut = (newValue: boolean): void => {

    state.localSittingOut = newValue;

};


const getHasPendingStatusRequest = computed((): boolean => {

    return state.hasPendingStatusRequest;

});

const setHasPendingStatusRequest = (newValue: boolean): void => {

    state.hasPendingStatusRequest = newValue;

};


export const tableState = {

    initialize,

    getTableID,
    setTableID,

    getTable,
    setTable,
    setTableState,

    getChipFormatter,
    setChipFormatter,

    getGame,
    setGame,

    getMessages,
    addMessage,

    getMySeatIndex,
    setMySeatIndex,
    getMySeat,

    /* Seat mutations */
    setIsInHand,

    getPlayer,
    setPlayer,
    setPlayerStatus,
    setPlayerChips,

    setAction,
    clearActions,

    startTimer,
    clearTimer,
    clearTimers,

    getPendingBetCommand,
    setPendingBetCommand,
    getPendingBetNumRaises,
    setPendingBetNumRaises,
    clearPendingBetCommands,

    getMyCall, 
    getMyMinRaise,
    getMyMaxRaise,

    getBetStatus,
    setBetStatus,

    setButtonIndex,

    dealCard,
    setHand,   // used for flipping cards over
    clearHand,  // used for folding

    setMuckedCards,
    clearMuckedCards,

    dealBoard,
    clearBoard,

    getCurrentBalance,
    setCurrentBalance,

    getShowdownRequired,
    setShowdownRequired,

    getWinningHand,
    setWinningHand,

    clearUsedCards,
    setUsedCards,
    isCardUsed,

    getGatheringAntes,
    setGatheringAntes,
    getGatheringBets,
    setGatheringBets,

    getWonPots,
    clearWonPots,
    addWonPot,

    getDealerPosition,
    setDealerPositions,

    getPlayerPosition,
    setPlayerPositions,

    getLocalSittingOut,
    setLocalSittingOut,
    getHasPendingStatusRequest,
    setHasPendingStatusRequest,


};

