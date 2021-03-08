import { reactive, computed } from "vue";

import { Table } from '@/app/casino/tables/table';


const state = reactive({

    table: null as Table

});


const getTable = computed((): Table => state.table);

const setTable = (table: Table): void => {
    state.table = table;
};


export const tableState = {

    getTable,
    setTable

};

