import { reactive, computed } from "vue";

import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
import { TableSummary } from '@/app/casino/tables/table-summary';
import { TournamentSummary } from '@/app/casino/tournaments/tournament-summary';


const state = reactive({

    tables: [] as TableSummary[],

    tournaments: [] as TournamentSummary[]

});


const getTables = computed((): TableSummary[] => state.tables);
const setTables = (tables: TableSummary[]): void => {
    state.tables = [...tables];
}

const getTournaments = computed((): TournamentSummary[] => state.tournaments);
const setTournaments = (tournaments: TournamentSummary[]): void => {
    state.tournaments = [...tournaments];
}


export const lobbyState = {

    getTables,
    setTables,

    getTournaments,
    setTournaments

};

