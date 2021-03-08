import { reactive, computed } from "vue";

import { UserSummary } from '@/app/players/user-summary';
import { Table } from '@/app/casino/tables/table';


const state = reactive({

    user: null as UserSummary,
    table: null as Table

});


const getUser = computed((): UserSummary => state.user);

const setUser = (user: UserSummary): void => {
    state.user = user;
};

const getTable = computed((): Table => state.table);

const setTable = (table: Table): void => {
    state.table = table;
};


const tableState = {

    getUser,
    setUser,

    getTable,
    setTable

};

export default tableState;
