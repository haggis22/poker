<template>

    <div>

        <div v-if="user">

            <h2>Welcome, {{ user.name }}</h2>
            <h4>Balance: {{ chipFormatter.format(balance) }}</h4>

        </div>

        <table cellpadding="5" cellspacing="0" class="table-tables">
            <thead>
                <tr>
                    <th>ID</th>
                    <th class="name">Name</th>
                    <th class="description">Desc</th>
                    <th class="players">Seats</th>
                </tr>
            </thead>
            <tbody>
                <table-component v-for="table in tables" 
                                :table="table" 
                                 :key="table.id">
                </table-component>
            </tbody>
        </table>

    </div>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { LobbyClient } from '../../lobby-client';

    import TableComponent from '../table/TableComponent.vue';

    import { TableSummary } from '@/app/casino/tables/table-summary';
    import { UserSummary } from '@/app/players/user-summary';

    import { userState } from "@/store/user-state";
    import { lobbyState } from "@/store/lobby-state";
    import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';



    const LobbyComponent = defineComponent({

        props: {
            client: {
                type: LobbyClient,
                required: true
            },
        },
        setup() {

            const user = computed((): UserSummary => userState.getUser.value);
            const tables = computed((): TableSummary[] => lobbyState.getTables.value);

            const chipFormatter = computed((): IChipFormatter => lobbyState.getChipFormatter.value);
            const balance = computed((): number => userState.getBalance.value);

            return {

                user,
                tables,

                chipFormatter,
                balance

            };

        },
        components: {
            TableComponent
        }

    });

    export default LobbyComponent;

</script>

<style scoped lang="scss">

    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;700&display=swap');

    $font: "Times New Roman", serif;

    .table-tables {
        border: 2px solid black;
        .name, .description
        {
            text-align: left;
        }

        .players
        {
            text-align: center;
        }

    }

</style>
