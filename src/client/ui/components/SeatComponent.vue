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
                <div v-for="dealtCard in seat.hand.cards" class="card card-small-2" :class="getCardClass(dealtCard)">
                    <div v-if="dealtCard != null && dealtCard.isFaceUp" class="symbols left">
                        <div class="value">{{ dealtCard.card.value.symbol }}</div>
                        <div class="suit">{{ dealtCard.card.suit.symbol }}</div>
                    </div>
                    <div v-if="dealtCard != null && dealtCard.isFaceUp" class="symbols right">
                        <div class="value">{{ dealtCard.card.value.symbol }}</div>
                        <div class="suit">{{ dealtCard.card.suit.symbol }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    console.log('Building SeatComponent');

import Vue from 'vue';

import { Seat } from '../../../casino/tables/seat';
import { BetTracker } from '../../../casino/tables/betting/bet-tracker';
import { TableUI } from '../../table-ui';
import { DealtCard } from '../../../hands/dealt-card';

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
    methods: {

        getCardClass: function (dealtCard: DealtCard) {

            if (!dealtCard) {
                return null;
            }

            if (dealtCard.isFaceUp) {
                return dealtCard.card.suit.text;
            }

            return 'face-down';

        }   // getCardClass

    }


});

export default SeatComponent;

</script>
