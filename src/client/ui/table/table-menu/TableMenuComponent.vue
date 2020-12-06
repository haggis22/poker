<template>

    <div class="table-menu">

        <div v-if="ui.isCheckBetTime()">
            <button type="button" v-on:click.stop="check">Check</button>
            <button type="button" v-on:click.stop="bet">Bet</button>
            <button type="button" v-on:click.stop="fold">Fold</button>
        </div>

        <div v-if="ui.isCallRaiseTime()">
            <button type="button" v-on:click.stop="call">Call</button>
            <button type="button" v-on:click.stop="raise">Raise</button>
            <button type="button" v-on:click.stop="fold">Fold</button>
        </div>


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

        call: function (event) {

            this.ui.betCommand(new BetCommand(this.ui.table.id, this.ui.table.betTracker.currentBet));

        },

        bet: function (event) {

            this.ui.betCommand(new BetCommand(this.ui.table.id, this.ui.table.betTracker.getMinimumBet(this.ui.mySeatIndex)));

        },

        raise: function (event) {

            this.ui.betCommand(new BetCommand(this.ui.table.id, this.ui.table.betTracker.getMinimumBet(this.ui.mySeatIndex)));

        },

        fold: function (event) {

            this.ui.foldCommand(new FoldCommand(this.ui.table.id));

        },


    }

});

export default TableMenuComponent;

</script>
