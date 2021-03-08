<template>

    <div>

        <h2 v-if="user">Welcome, {{ userName }}</h2>

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
                <tr v-for="table in tables" :key="table.id">
                    <td>{{ table.id }}</td>
                    <td class="name"><router-link :to="{ name: 'Table' , params: {tableID: table.id}}" target="_blank">{{ table.name }}</router-link></td>
                    <td class="description">{{ table.description }}</td>
                    <td class="players">{{ table.numPlayers }}/{{ table.numSeats }}</td>
                </tr>
            </tbody>
        </table>

    </div>

</template>

<script lang="ts">

    import './lobby.scss';

    import { defineComponent } from 'vue';

    import { LobbyClient } from '../../lobby-client';
    import { TableSummary } from '@/app/casino/tables/table-summary';
    import { UserSummary } from '@/app/players/user-summary';

    import { userState } from "@/store/user-state";
    import { lobbyState } from "@/store/lobby-state";



    const LobbyComponent = defineComponent({

        setup() {

        },

        props: {
            client: {
                type: LobbyClient,
                required: true
            },
        },
        data() {

            const values = {
            };

            return values;

        },
        computed: {

            user(): UserSummary {

                return userState.getUser.value

            },

            userName(): string {

                return this.user?.name;

            },

            tables(): Array<TableSummary> {

                return lobbyState.getTables.value

            }

        },
        methods: {

        },

    components: {
    }

});

    export default LobbyComponent;

</script>

<style scoped lang="scss">

    .table-tables
    {
        border: 2px solid black;

        .name,
        .description
        {
            text-align: left;
        }

        .players
        {
            text-align: center;
        }

    }

</style>
