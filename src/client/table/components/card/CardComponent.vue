<template>
    <div class="card card-small-2" :class="cardClasses" :style="{ 'top': `${top}px`, 'left': `${left}px`, 'z-index': this.index + 1 }">
        <div class="card-inner">
            <div class="card-front">
                <div v-if="isFaceUp" class="symbols left">
                    <div class="value">{{ card.value.symbol }}</div>
                    <div class="suit">{{ card.suit.symbol }}</div>
                </div>
                <div v-if="isFaceUp" class="symbols right">
                    <div class="value">{{ card.value.symbol }}</div>
                    <div class="suit">{{ card.suit.symbol }}</div>
                </div>
            </div>
            <div class="card-back">
                &nbsp;
            </div>
        </div>
    </div>
</template>


<script lang="ts">

import './card.scss';

import Vue from 'vue';

import { Card } from '../../../../cards/card';
import { FacedownCard } from '../../../../cards/face-down-card';
import { UIPosition } from '../../../ui-position';

    const CardComponent = Vue.extend({

        props: {
            card: {
                type: [Card, FacedownCard],
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            startDealing: {
                type: Boolean,
                required: true
            },
            startMucking: {
                type: Boolean,
                required: true
            },
            isShowdown: {
                type: Boolean,
                required: true
            },
            isUsed: {
                type: Boolean,
                required: true
            },
            dealerPosition: {
                type: UIPosition,
                required: true
            }
        },

    data() {

        let values =
        {
            isDealing: this.startDealing,
            isDealt: false,
            isMucking: this.startMucking,
            isMucked: false,
            timer: ''
        };

        return values;

    },
    created() {

        // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
        this.timer = setTimeout(() => {

            if (this.isDealing) {

                console.log(`Moving from isDealerHolding to isDealing from ${this.card}`);
                // In one stroke, set the card moving and take it out of the dealer's hand
                this.isDealing = !(this.isDealt = true);

            }

            if (this.isMucking) {

                // In one stroke, set the card moving and take it out of the player's hand
                this.isMucking = !(this.isMucked = true);

            }

        }, 300);

    },
    computed: {

        isFaceUp: function () {

            return this.card instanceof Card;

        },
        cardClasses: function () {

            if (!this.card) {
                return null;
            }

            let classes: string[] = [];

            if (this.card instanceof Card) {

                classes.push(this.card.suit.text);

            }
            else {
                classes.push('face-down');
            }

            if (this.isUsed) {

                classes.push('used');

            }

            if (this.isDealing) {
                classes.push('dealing');
                classes.push('face-down');
            }
            else if (this.isDealt) {
                classes.push('dealt');
            }
            else if (this.isMucking) {
                classes.push('mucking');
            }
            else if (this.isMucked) {
                classes.push('mucked');
                classes.push('face-down');
            }

            return classes;

        },
        top: function () {

            if (this.isDealing || this.isMucked) {

                return this.dealerPosition.top;

            }
            else if (this.isDealt || this.isMucking) {

                return 5;

            }
        },

        left: function () {

            if (this.isDealing || this.isMucked) {

                return this.dealerPosition.left;

            }
            else if (this.isDealt || this.isMucking) {

                return 15 + (this.index * 15);

            }

        },

    },
    methods: {

    },
    beforeDestroy() {
        clearTimeout(this.timer);
    }

});

export default CardComponent;

</script>
