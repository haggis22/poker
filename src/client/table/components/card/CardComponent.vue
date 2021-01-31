<template>
    <div v-if="isVisible" :class="cardClasses" :style="{ 'top': `${top}px`, 'left': `${left}px` }">
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
import { CardUI } from '../../card-ui';
import { FacedownCard } from '../../../../cards/face-down-card';

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
            isFolding: {
                type: Boolean,
                required: false
            },
            isGhost: {
                type: Boolean,
                required: false
            }
        },

    data() {

        let values =
        {
            cardUI: new CardUI(this.index)
        };

        return values;

    },
    mounted() {

        this.$emit('card-created', this.cardUI);

    },
    computed: {

        isVisible: function () {

            return this.cardUI.top != null;

        },
        isFaceUp: function () {

            return this.card instanceof Card;

        },
        top: function () {

            return this.cardUI.top;

        },
        left: function () {

            return this.cardUI.left;

        },
        cardClasses: function () {

            let classes: string[] = [ 'card', 'card-small-2' ];

            if (this.card instanceof Card) {

                classes.push(this.card.suit.text);

                if (this.cardUI.isFacedown) {
                    classes.push('face-down');
                }

            }
            else {
                classes.push('face-down');
            }

            if (this.isGhost) {
                classes.push('ghost');
            }

            if (this.isFolding) {
                classes.push('folding');
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
