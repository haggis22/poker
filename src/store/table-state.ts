import { ref, computed } from "vue";

import { Table } from '@/app/casino/tables/table';
import { Game } from '@/app/games/game';
import { Player } from '@/app/players/player';
import { Seat } from '@/app/casino/tables/seat';


const state = ref({

    table: null as Table,
    game: null as Game,
    messages: [] as string[]

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

export const tableState = {

    getTable,
    setTable,

    getGame,
    setGame,

    getMessages,
    addMessage,

    setPlayer

};

