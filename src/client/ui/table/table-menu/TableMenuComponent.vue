<template>

    <div class="table-menu">

        <div class="bet-actions" v-if="ui.isCheckBetTime()">
            <button type="button" v-on:click.stop="fold">
                <div class="action">Fold</div>
            </button>
            <button type="button" v-on:click.stop="check">
                <div class="action">Check</div>
            </button>
            <button type="button" v-on:click.stop="bet">
                <div class="action">Bet</div>
                <div class="amount">{{ ui.chipFormatter.format(ui.myBetAmount) }}</div>
            </button>
        </div>

        <div class="bet-actions" v-if="ui.isCallRaiseTime()">
            <button type="button" v-on:click.stop="fold">
                <div class="action">Fold</div>
            </button>
            <button type="button" v-if="ui.myAmountToCall > 0" v-on:click.stop="call">
                <div class="action">Call</div>
                <div class="amount">{{ ui.chipFormatter.format(ui.myAmountToCall) }}</div>
            </button>
            <button type="button" v-on:click.stop="raise">
                <div class="action">Raise</div>
                <div class="amount">{{ ui.chipFormatter.format(ui.myBetAmount) }}</div>
            </button>
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
