<template>
    <div v-if="seat != null" class="seat" :class="[ 'seat-'+seat.index, { 'action-on': betTracker.seatIndex == seat.index }]">
        <div class="name"><span v-if="seat.player != null">{{ seat.player.name }}</span></div>
        <div class="avatar">
            <div class="action-container">
                <div class="action" v-if="ui.seatAction.has(seat.index)">{{ ui.seatAction.get(seat.index) }}</div>
            </div>
        </div>
        <div class="chips"><span v-if="seat.player != null">{{ ui.chipFormatter.format(seat.player.chips) }}</span></div>
        <div class="cards">
            <div v-if="seat.hand">
                <card-component v-for="(card, index) in seat.hand.cards" :key="`card-${index}`" :card="card"></card-component>
            </div>
        </div>
    </div>
</template>


<script lang="ts">


import './seat.scss';

import Vue from 'vue';

import { Seat } from '../../../../casino/tables/seat';
import { BetTracker } from '../../../../casino/tables/betting/bet-tracker';
import { TableUI } from '../../../table-ui';

import CardComponent from '../card/CardComponent';

const SeatComponent = Vue.extend ({

    props: {
        seat: {
            type: Seat,
            required: true
        },
        betTracker: {
            type: BetTracker,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    components: {
        'card-component': CardComponent
    }

});

export default SeatComponent;

</script>
