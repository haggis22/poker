<template>
    <div class="card card-small-2" :class="getCardClass(dealtCard)">
        <div v-if="dealtCard != null && dealtCard.isFaceUp" class="symbols left">
            <div class="value">{{ dealtCard.card.value.symbol }}</div>
            <div class="suit">{{ dealtCard.card.suit.symbol }}</div>
        </div>
        <div v-if="dealtCard != null && dealtCard.isFaceUp" class="symbols right">
            <div class="value">{{ dealtCard.card.value.symbol }}</div>
            <div class="suit">{{ dealtCard.card.suit.symbol }}</div>
        </div>
    </div>
</template>


<script lang="ts">

import './card.scss';

import Vue from 'vue';

import { TableUI } from '../../../table-ui';
import { CardUI } from '../../cards/card-ui';

const CardComponent = Vue.extend ({

    props: {
        index: {
            type: Number,
            required: true
        },
        card: {
            type: CardUI,
            required: true
        }
    },
    methods: {

        getCardClass: function (cardUI: CardUI) {

            if (!cardUI || !cardUI.card) {
                return null;
            }

            let classes: string[] = [];

            if (cardUI.card.isFaceUp) {
                classes.push(cardUI.card.card.suit.text);
            }
            else {
                classes.push('face-down');
            }

            if (cardUI.isDealt) {
                classes.push('dealt');
            }

            if (cardUI.isInHand) {
                classes.push('in-hand');

            }
            return classes;

        }   // getCardClass

    }


});

    export default CardComponent;

</script>
