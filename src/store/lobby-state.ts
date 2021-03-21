import { reactive, computed } from "vue";

import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
import { TableSummary } from '@/app/casino/tables/table-summary';


const state = reactive({

    chipFormatter: null as IChipFormatter,

    tables: [] as TableSummary[]

});


const getChipFormatter = computed(() => state.chipFormatter);
const setChipFormatter = (formatter: IChipFormatter): void => {

    state.chipFormatter = formatter;

}

const getTables = computed((): TableSummary[] => state.tables);
const setTables = (tables: TableSummary[]): void => {
    state.tables = [...tables];
}


export const lobbyState = {

    getChipFormatter,
    setChipFormatter,

    getTables,
    setTables

};

