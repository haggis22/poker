<template>
    <div class="card card-small-2" :class="cardClass">
        <div v-if="isFaceUp" class="symbols left">
            <div class="value">{{ cardUI.card.value.symbol }}</div>
            <div class="suit">{{ cardUI.card.suit.symbol }}</div>
        </div>
        <div v-if="isFaceUp" class="symbols right">
            <div class="value">{{ cardUI.card.value.symbol }}</div>
            <div class="suit">{{ cardUI.card.suit.symbol }}</div>
        </div>
    </div>
</template>


<script lang="ts">

import './card.scss';

import Vue from 'vue';

import { TableUI } from '../../../table-ui';
import { CardUI } from '../../cards/card-ui';
import { Card } from '../../../../cards/card';

const CardComponent = Vue.extend ({

    props: {
        cardUI: {
            type: CardUI,
            required: true
        },
        isDealerHolding: {
            type: Boolean,
            required: true
        },
        isDealing: {
            type: Boolean,
            required: true
        },
    },
    computed: {

        isFaceUp: function () {

            return this.cardUI.card instanceof Card;

        },
        cardClass: function () {

            if (!this.cardUI || !this.cardUI.card) {
                return null;
            }

            console.log(`In cardClass for ${this.cardUI.card}`);

            let classes: string[] = [];

            if (this.cardUI.card instanceof Card) {

                classes.push(this.cardUI.card.suit.text);

            }
            else {
                classes.push('face-down');
            }

            if (this.isDealerHolding) {
                classes.push('dealer-holding');
            }
            else if (this.isDealing) {
                classes.push('dealing');
            }

            return classes;


        }

    },
    methods: {


        cardClasses: function (cardUI) {

            if (!cardUI || !cardUI.card) {
                return null;
            }

            let classes: string[] = [];

            if (cardUI.card instanceof Card) {

                classes.push(cardUI.card.suit.text);

            }
            else {
                classes.push('face-down');
            }

            if (cardUI.isDealerHolding) {
                console.log(`Dealer is holding card`);
                classes.push('dealer-holding');
            }
            else if (cardUI.isDealing) {
                classes.push('dealing');
            }

            return classes;


        }

    }

});

    export default CardComponent;

</script>
