<template>

    <div>

        <div class="cash-games">

            <table cellpadding="5" cellspacing="0" class="table-tables">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th class="name">Name</th>
                        <th class="description">Desc</th>
                        <th class="seats">Seats</th>
                        <th class="players">Players</th>
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


        <div class="tournaments">

            <table cellpadding="5" cellspacing="0" class="table-tournaments">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th class="name">Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tournament-component v-for="tournament in tournaments"
                                     :tournament="tournament"
                                     :key="tournament.id">
                    </tournament-component>
                </tbody>
            </table>

        </div>


    </div>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import TableComponent from '../table/TableComponent.vue';
    import TournamentComponent from '../tournament/TournamentComponent.vue';

    import { TableSummary } from '@/app/casino/tables/table-summary';
    import { TournamentSummary } from '@/app/casino/tournaments/tournament-summary';

    import { lobbyState } from "@/store/lobby-state";



    const LobbyComponent = defineComponent({

        setup() {

            const tables = computed((): TableSummary[] => lobbyState.getTables.value);

            const tournaments = computed((): TournamentSummary[] => lobbyState.getTournaments.value);


            return {

                tables,

            };

        },
        components: {
            TableComponent,
            TournamentComponent
        }

    });

    export default LobbyComponent;

</script>

<style scoped lang="scss">

    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;700&display=swap');

    $font: "Times New Roman", serif;

    .table-tables {

        border: 2px solid black;

        .name, 
        .description,
        .players
        {
            text-align: left;
        }

        .seats
        {
            text-align: center;
        }

    }

</style>
