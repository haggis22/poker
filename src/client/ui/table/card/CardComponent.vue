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

import { TableUI } from '../../../table-ui';
import { Card } from '../../../../cards/card';
import { FacedownCard } from '../../../../cards/face-down-card';

const CardComponent = Vue.extend ({

    props: {
        card: {
            type: [ Card, FacedownCard],
            required: true
        }
    },

    data() {

        let values =
        {
            isDealerHolding: true,
            isDealing: false,
            timer: ''
        };

        return values;

    },
    created() {

        // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
        this.timer = setTimeout(() => {

            console.log(`Moving from isDealerHolding to isDealing from ${this.card}`);
            // In one stroke, set the card moving and take it out of the dealer's hand
            this.isDealerHolding = !(this.isDealing = true);

            this.timer = setTimeout(() => {

                console.log(`Removing isDealing from ${this.card}`);
                this.isDealing = false;

            }, 300);

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

            if (this.isDealerHolding) {
                classes.push('dealer-holding');
                classes.push('face-down');
            }
            else if (this.isDealing) {
                classes.push('dealing');
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
