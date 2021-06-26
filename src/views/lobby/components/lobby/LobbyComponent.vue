<template>

    <div>

        <div class="cash-games">

            <h3>Cash Games</h3>

            <table cellpadding="5" cellspacing="0" class="table-tables">
                <thead>
                    <tr>
                        <th class="id">ID</th>
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

            <h3>Tournaments</h3>

            <table cellpadding="5" cellspacing="0" class="table-tournaments">
                <thead>
                    <tr>
                        <th class="id">ID</th>
                        <th class="name">Name</th>
                        <th class="buy-in">Buy In</th>
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

                tournaments

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

    .table-tables,
    .table-tournaments {

        border: 2px solid black;
        width: 500px;

        &::v-deep .id, &::v-deep .name, &::v-deep .description, &::v-deep .players
        {
            text-align: left;
        }

        &::v-deep
        .seats {
            text-align: center;
        }

        &::v-deep
        .buy-in {
            text-align: right;
        }

    }

</style>
