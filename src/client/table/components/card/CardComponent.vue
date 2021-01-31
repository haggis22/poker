<template>
    <div class="card card-small-2" :class="cardClasses">
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
    import { TableUI } from '../../table-ui';

    const CardComponent = Vue.extend({

        props: {
            card: {
                type: [Card, FacedownCard],
                required: true
            },
            ui: {
                type: TableUI,
                required: true
            },
            startDealing: {
                type: Boolean,
                required: false
            },
            startMucking: {
                type: Boolean,
                required: false
            }
        },

    data() {

        let values =
        {
            isDealerHolding: this.startDealing,
            isDealing: false,
            isDealt: false,
            isPlayerHolding: this.startMucking,
            isMucking: false,
            isMucked: false,
            timer: ''
        };

        return values;

    },
    created() {

        // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
        this.timer = setTimeout(() => {

            if (this.isDealerHolding) {

                console.log(`Moving from isDealerHolding to isDealing from ${this.card}`);
                // In one stroke, set the card moving and take it out of the dealer's hand
                this.isDealerHolding = !(this.isDealing = true);

                this.timer = setTimeout(() => {

                    console.log(`Removing isDealing from ${this.card}`);
                    this.isDealing = !(this.isDealt = true);

                }, 300);

            }

            if (this.isPlayerHolding) {

                // In one stroke, set the card moving and take it out of the player's hand
                this.isPlayerHolding = !(this.isMucking = true);

                this.timer = setTimeout(() => {

                    console.log(`Removing isMucking from ${this.card}`);
                    this.isMucking = !(this.isMucked = true);

                }, 300);

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

            console.log(`In cardClass for ${this.card}`);

            let classes: string[] = [];

            if (this.card instanceof Card) {

                classes.push(this.card.suit.text);

            }
            else {
                classes.push('face-down');
            }

            if (this.ui.isCardUsed(this.card)) {

                classes.push('used');

            }

            if (this.isDealerHolding) {
                classes.push('dealer-holding');
                classes.push('face-down');
            }
            else if (this.isDealing) {
                classes.push('dealing');
            }
            else if (this.isDealt) {
                classes.push('dealt');
            }
            else if (this.isPlayerHolding) {
                classes.push('player-holding');
            }
            else if (this.isMucking) {
                classes.push('mucking');
                classes.push('face-down');
            }
            else if (this.isMucked) {

                if (this.card instanceof Card) {

                    classes.push('muck-fish');

                }
                else {

                    classes.push('mucked');

                }

            }

            return classes;


        }

    },
    methods: {

    },
    beforeDestroy() {
        clearTimeout(this.timer);
    }

});

export default CardComponent;

</script>
