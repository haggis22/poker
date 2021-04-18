import { reactive, computed } from "vue";

import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
import { TableSummary } from '@/app/casino/tables/table-summary';


const state = reactive({

    tables: [] as TableSummary[]

});


const getTables = computed((): TableSummary[] => state.tables);
const setTables = (tables: TableSummary[]): void => {
    state.tables = [...tables];
}


export const lobbyState = {

    getTables,
    setTables

};

