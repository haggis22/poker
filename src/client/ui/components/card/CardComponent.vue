<template>
    <div class="card card-small-2" :class="getCardClass(card)">
        <div v-if="isFaceUp" class="symbols left">
            <div class="value">{{ card.value.symbol }}</div>
            <div class="suit">{{ card.suit.symbol }}</div>
        </div>
        <div v-if="isFaceUp" class="symbols right">
            <div class="value">{{ card.value.symbol }}</div>
            <div class="suit">{{ card.suit.symbol }}</div>
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
            type: [Card, FacedownCard],
            required: true
        }
    },
    computed: {

        isFaceUp: function () {

            return this.card instanceof Card;

        }

    },
    methods: {

        getCardClass: function (dealtCard: Card | FacedownCard) {

            if (!dealtCard) {
                return null;
            }

            let classes: string[] = [];

            if (dealtCard instanceof Card) {
                classes.push(dealtCard.suit.text);
            }
            else {
                classes.push('face-down');
            }

/*
            if (dealtCard.card.isDealt) {
                classes.push('dealt');
            }
*/
            classes.push('dealt');

            return classes;

        }   // getCardClass

    }


});

    export default CardComponent;

</script>
