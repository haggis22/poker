<template>
    <div v-if="seat != null" class="seat" :class="seatClasses">
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
        <div class="chips"><span v-if="seat.player != null">{{ ui.chipFormatter.format(seat.player.chips) }}</span></div>
        <div class="cards">
            <div v-if="seat.player && seat.player.isSittingOut" class="sitting-out">
                [ Sitting Out ]
            </div>
            <div v-if="seat.hand">
                <card-component v-for="(card, index) in seat.hand.cards"
                                :key="`card-${index}`"
                                :card="card"
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
import { TableUI } from '../../../table-ui';

import CardComponent from '../card/CardComponent';
import TimerComponent from '../timer/TimerComponent';

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

            let classes = [`seat-${this.seat.index}`];

            if (this.betStatus && this.betStatus.seatIndex == this.seat.index) {

                classes.push('action-on');

            }

            if (this.seat.player && this.seat.player.isSittingOut) {
                classes.push('sitting-out');
            }

            if (this.ui.isShowdownRequired) {

                classes.push('showdown');

            }

            return classes;

        }

    }

});

export default SeatComponent;

</script>
