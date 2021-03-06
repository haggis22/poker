<template>
    <div v-if="seat != null" :class="seatClasses">
        <div class="name">
            <span v-if="seat.player != null">
                {{ seat.player.name }}
            </span>
        </div>
        <div class="avatar">
            <div class="action-container">
                <timer-component v-if="ui.seatTimer.has(seat.index)" :timer="ui.seatTimer.get(seat.index)"></timer-component>
                <div class="action" v-if="ui.seatAction.has(seat.index)">
                    {{ ui.seatAction.get(seat.index) }}
                </div>
            </div>
        </div>
        <div :class="chipsClasses">
            <span v-if="seat.player != null">
                <span v-if="seat.isAllIn()">[ ALL IN ]</span>
                <span v-else>{{ ui.chipFormatter.format(seat.player.chips) }}</span>
            </span>
        </div>
        <div class="cards">
            <div v-if="!seat.player && !ui.getMySeat()">
                <button type="button"   
                        class="sit"
                        v-on:click.stop="sit">
                    Sit
                </button>
            </div>
            <div v-if="seat.player && seat.player.isSittingOut" class="sitting-out">
                [ Sitting Out ]
            </div>
            <hand-component v-if="seat.hand"
                            :cards="seat.hand.cards"
                            :ui="ui"
                            :dealer-position="dealerPosition"></hand-component>

            <folding-component v-if="ui.muckedCards.has(seat.index)"
                                :cards="ui.muckedCards.get(seat.index)"
                                :ui="ui"
                                :dealer-position="dealerPosition"></folding-component>

            <ghost-hand-component v-if="ui.muckedCards.has(seat.index) && ui.mySeatIndex == seat.index"
                                :cards="ui.muckedCards.get(seat.index)"
                                :ui="ui"
                                :dealer-position="dealerPosition"></ghost-hand-component>

        </div>
    </div>
</template>


<script lang="ts">


import './seat.scss';

import Vue from 'vue';

import { Seat } from '../../../../casino/tables/seat';
import { BetStatus} from '../../../../casino/tables/betting/bet-status';
import { TableUI } from '../../table-ui';
import { RequestSeatCommand } from '../../../../commands/table/request-seat-command';

import HandComponent from '../hand/HandComponent.vue';
    import FoldingComponent from '../folding/FoldingComponent.vue';
import TimerComponent from '../timer/TimerComponent.vue';
import GhostHandComponent from '../ghost-hand/GhostHandComponent.vue';

const SeatComponent = Vue.extend ({

    props: {
        seat: {
            type: Seat,
            required: true
        },
        betStatus: {
            type: BetStatus,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    data() {

        let values = {
            dealerPosition: this.ui.dealerPositions.get(this.seat.index)
        };

        return values;

    },
    components: {
        'hand-component': HandComponent,
        'folding-component': FoldingComponent,
        'ghost-hand-component': GhostHandComponent,
        'timer-component': TimerComponent
    },
    computed: {

        hasTimer: function () {

            // the value of this seat's index in the seatTimer object map will be `null` if there is
            // not a currently-active Timer object
            return this.ui && this.ui.seatTimer && this.ui.seatTimer.get(this.seat.index) != null;

        },

        seatClasses: function () {

            let classes = [ 'seat', `seat-${this.seat.index}`];

            if (this.ui.isActionOn(this.seat.index)) {

                classes.push('action-on');

            }

            if (this.seat.player && this.seat.player.isSittingOut) {
                classes.push('sitting-out');
            }

            if (this.ui.isShowdownRequired) {

                classes.push('showdown');

            }

            if (this.seat.isAllIn()) {

                classes.push('all-in');

            }

            return classes;

        },
        chipsClasses: function () {

            let classes = ['chips'];

            if (this.seat && this.seat.isInHand && this.seat.player && this.seat.player.chips === 0) {

                classes.push('all-in');

            }

            return classes;

        }

    },
    methods: {

        sit: function (event) {

            if (this.ui && this.ui.table && this.seat) {

                this.ui.sendCommand(new RequestSeatCommand(this.ui.table.id, this.seat.index));

            }

        }

    }


});

export default SeatComponent;

</script>
