<template>

    <div>

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

import Vue from 'vue';
    import { TableSummary } from '../../../../casino/tables/table-summary';
    import { LobbyClient } from '../../lobby-client';


const LobbyComponent = Vue.extend({

    props: {
        client: {
            type: LobbyClient,
            required: true
        }
    },
    components: {
    }

});

    export default LobbyComponent;

</script>

