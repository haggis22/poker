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
                <div class="action" v-if="ui.seatAction.has(seat.index)">{{ ui.seatAction.get(seat.index) }}</div>
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
                        v-on:click.stop="sit">Sit</button>
            </div>
            <div v-if="seat.player && seat.player.isSittingOut" class="sitting-out">
                [ Sitting Out ]
            </div>
            <div v-if="seat.hand">
                <card-component v-for="(card, index) in seat.hand.cards"
                                :key="`card-${index}`"
                                :card="card"
                                :start-dealing="true"
                                :ui="ui"></card-component>
            </div>
            <div v-if="ui.muckedCards.has(seat.index)">
                <card-component v-for="(card, index) in ui.muckedCards.get(seat.index)"
                                :key="`mucked-card-${index}`"
                                :card="card"
                                :start-mucking="true"
                                :ui="ui"></card-component>
            </div>
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
import { Card } from '../../../../cards/card';
import { FacedownCard } from '../../../../cards/face-down-card';

import CardComponent from '../card/CardComponent.vue';
import TimerComponent from '../timer/TimerComponent.vue';

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
    components: {
        'card-component': CardComponent,
        'timer-component': TimerComponent
    },
    computed: {

        seatClasses: function () {

            let classes = [ 'seat', `seat-${this.seat.index}`];

            if (this.betStatus && this.betStatus.seatIndex == this.seat.index) {

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
