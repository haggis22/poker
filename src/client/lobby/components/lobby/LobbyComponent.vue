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
                <tr v-for="table in tables" :key="table.id">
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


const LobbyComponent = Vue.extend({
    props: {
    },
    data() {

        let tables: Array<TableSummary> = new Array<TableSummary>();

        tables.push(new TableSummary(1, "Corn Dog Table", "LHE 1/2", 6, 4));

        let values = {

            tables: tables

        };

        return values;
    },
    components: {
    }

});

    export default LobbyComponent;

</script>

