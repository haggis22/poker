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
        index: {
            type: Number,
            required: true
        },
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

        getCardClass: function (dealtCard: DealtCard, ui: TableUI) {

            if (!dealtCard) {
                return null;
            }

            let classes: string[] = [];

            if (dealtCard.isFaceUp) {
                classes.push(dealtCard.card.suit.text);
            }
            else {
                classes.push('face-down');
            }

            return classes;

        }   // getCardClass

    }


});

    export default CardComponent;

</script>
