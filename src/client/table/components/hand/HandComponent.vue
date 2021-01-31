<template>
    <div class="hand">
        <card-component v-for="(card, index) in this.cards"
                        :key="`card-${index}`"
                        :card="card"
                        :index="index"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">


import './hand.scss';

import Vue from 'vue';

import { TableUI } from '../../table-ui';
    import CardComponent from '../card/CardComponent.vue';
import { CardUI } from '../../card-ui';
import { UIPosition } from '../../../ui-position';



const HandComponent = Vue.extend ({

    props: {
        cards: {
            type: Array,
            required: true
        },
        dealerPosition: {
            type: UIPosition,
            required: true
        }
    },
    data: {

    },

   components: {
        'card-component': CardComponent
    },
    computed: {


    },
    methods: {

        cardCreated(card: CardUI) {

            console.log(`Starting animation for ${card.index}`)
            card.top = this.dealerPosition.top;
            card.left = this.dealerPosition.left;
            card.isFacedown = true;

            // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
            setTimeout(() => {

                card.top = 10;
                card.left = 30 + (card.index * 20);
                card.isFacedown = false;

            }, 300);

        }

    }

});

export default HandComponent;

</script>
