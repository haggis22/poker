import { reactive, computed } from "vue";

import { TableSummary } from '@/app/casino/tables/table-summary';
import { UserSummary } from '@/app/players/user-summary';


const state = reactive({

    user: null as UserSummary,
    tables: [] as TableSummary[]

});




const getUser = computed((): UserSummary => state.user);

const setUser = (user: UserSummary): void => {
    state.user = user;
};

const getTables = computed((): TableSummary[] => state.tables);
const setTables = (tables: TableSummary[]): void => {
    state.tables = [...tables];
}


const lobbyState = {

    getUser,
    setUser,

    getTables,
    setTables

};

export default lobbyState;
