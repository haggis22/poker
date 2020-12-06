<template>

    <div class="table-menu">

        <button type="button" v-on:click.stop="check">Check</button>
        <button type="button" v-on:click.stop="bet">Bet</button>
        <button type="button" v-on:click.stop="fold">Fold</button>

    </div>

</template>


<script lang="ts">
    
import './table-menu.scss';

import Vue from 'vue';

import { TableUI } from '../../../table-ui';
import { BetCommand } from '../../../../commands/table/betting/bet-command';
import { FoldCommand } from '../../../../commands/table/betting/fold-command';

const TableMenuComponent = Vue.extend ({

    props: {
        ui: {
            type: TableUI,
            required: true
        }
    },
    methods: {

        check: function (event) {

            this.ui.betCommand(new BetCommand(this.ui.table.id, 0));

        },

        bet: function (event) {

            this.ui.betCommand(new BetCommand(this.ui.table.id, 100));

        },

        fold: function (event) {

            this.ui.foldCommand(new FoldCommand(this.ui.table.id));

        },


    }

});

export default TableMenuComponent;

</script>
