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
import { DealtCard } from '../../../../hands/dealt-card';

const CardComponent = Vue.extend ({

    props: {
        dealtCard: {
            type: DealtCard,
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

    export default CardComponent;

</script>
