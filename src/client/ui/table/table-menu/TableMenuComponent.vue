<template>

    <div class="table-menu">

        <div class="sit-out">

            <label>
                <input type="checkbox" value="true" :checked="isSittingOut" @change="setStatus" />

                Sit out next hand
            </label>

        </div>

        <div class="bet-actions" v-if="ui.isAnteTime()">
            <button type="button" v-on:click.stop="fold">
                <div class="action">Sit Out</div>
            </button>
            <button type="button" v-on:click.stop="ante">
                <div class="action">Ante</div>
                <div class="amount">
                    {{ ui.chipFormatter.format(ui.myAmountToCall) }}
                </div>
            </button>
        </div>

        <div class="bet-actions" v-if="ui.isPendingCheckBetTime()">
            <label>
                <input type="checkbox" value="true" :checked="pendingFold" @change="$emit('update:pendingFold', $event.target.checked)" /> Fold
            </label>
            <label>
                <input type="checkbox" /> Check
            </label>
            <label>
                <input type="checkbox" /> Bet {{ ui.chipFormatter.format(ui.myBetAmount) }}
            </label>
        </div>

        <div class="bet-actions" v-if="ui.isCheckBetTime()">
            <button type="button" v-on:click.stop="fold">
                <div class="action">Fold</div>
            </button>
            <button type="button" v-on:click.stop="check">
                <div class="action">Check</div>
            </button>
            <button v-if="isRaiseAllowed" type="button" v-on:click.stop="bet">
                <div class="action">Bet</div>
                <div class="amount">{{ ui.chipFormatter.format(ui.myBetAmount) }}</div>
            </button>
            <button v-if="!isRaiseAllowed" type="button" disabled>
                <div class="action">Bet</div>
            </button>
        </div>

        <div class="bet-actions" v-if="ui.isPendingCallRaiseTime()">
            <label>
                <input type="checkbox" value="true" :checked="pendingFold" @change="$emit('update:pendingFold', $event.target.checked)" /> Fold
            </label>
            <label>
                <input type="checkbox" /> Call
            </label>
            <label>
                <input type="checkbox" /> Raise {{ ui.chipFormatter.format(ui.myBetAmount) }}
            </label>
        </div>

        <div class="bet-actions" v-if="ui.isCallRaiseTime()">
            <button type="button" v-on:click.stop="fold">
                <div class="action">Fold</div>
            </button>
            <button type="button" v-on:click.stop="call">
                <div class="action">Call</div>
                <div class="amount">{{ ui.chipFormatter.format(ui.myAmountToCall) }}</div>
            </button>
            <button v-if="isRaiseAllowed" type="button" v-on:click.stop="bet">
                <div class="action">Raise</div>
                <div class="amount">{{ ui.chipFormatter.format(ui.myBetAmount) }}</div>
            </button>
            <button v-if="!isRaiseAllowed" type="button" disabled>
                <div class="action">Raise</div>
            </button>
        </div>

    </div>

</template>


<script lang="ts">
    
import './table-menu.scss';

import Vue from 'vue';

import { TableUI } from '../../../table-ui';
import { Seat } from '../../../../casino/tables/seat';
import { AnteCommand } from '../../../../commands/table/betting/ante-command';
import { BetCommand } from '../../../../commands/table/betting/bet-command';
import { FoldCommand } from '../../../../commands/table/betting/fold-command';
import { SetStatusCommand } from '../../../../communication/serializable';
import { PendingCommands } from '../../state/pending-commands';

const TableMenuComponent = Vue.extend ({

    props: {
        ui: {
            type: TableUI,
            required: true
        },
        isSittingOut: {
            type: Boolean, 
            required: false
        },
        pendingFold: {
            type: Boolean,
            required: false
        }

    },
    data() {

        let values =
        {
        }

        return values;

    },
    computed: {

        isRaiseAllowed: function () {

            let mySeat: Seat = this.ui.getMySeat();

            if (mySeat) {

                return this.ui.betController.calculateMinimumRaise(this.ui.table, mySeat) != null;

            }

            return false;

        }

    },
    methods: {

        ante: function (event) {

            this.ui.sendCommand(new AnteCommand(this.ui.table.id));

        },

        check: function (event) {

            this.ui.sendCommand(new BetCommand(this.ui.table.id, 0));

        },

        call: function (event) {

            this.ui.sendCommand(new BetCommand(this.ui.table.id, this.ui.myAmountToCall));

        },

        bet: function (event) {

            this.ui.sendCommand(new BetCommand(this.ui.table.id, this.ui.myBetAmount));

        },

        fold: function (event) {

            this.ui.sendCommand(new FoldCommand(this.ui.table.id));

        },

        setStatus: function (event) {

            // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
            this.ui.sendCommand(new SetStatusCommand(this.ui.table.id, event.target.checked));
            this.$emit('update:isSittingOut', event.target.checked);

        }

    }

});

export default TableMenuComponent;

</script>
