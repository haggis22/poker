<template>

    <div>

        <div v-if="client != null">NumTables: {{ client.tables.length }}</div>

        <div>Count: {{ count }}</div>

        <table cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Desc</th>
                    <th>Seats</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="table in client.tables" :key="table.id">
                    <td>{{ table.id }}</td>
                    <td><router-link :to="{ name: 'Table' , params: {tableID: table.id}}" target="_blank">{{ table.name }}</router-link></td>
                    <td>{{ table.description }}</td>
                    <td>{{ table.numPlayers }}/{{ table.numSeats }}</td>
                </tr>
            </tbody>
        </table>

    </div>

</template>

<script lang="ts">

import './lobby.scss';

import { defineComponent } from 'vue';
import { LobbyClient } from '../../lobby-client';


    const LobbyComponent = defineComponent({

    props: {
        client: {
            type: LobbyClient,
            required: true
        },
    },
        computed: {

            count(): number {

                return this.$store.state.count;

            }


        },

    components: {
    }

});

    export default LobbyComponent;

</script>

