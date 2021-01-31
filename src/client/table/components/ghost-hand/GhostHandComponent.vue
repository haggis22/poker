<template>
    <div class="hand">
        <card-component v-for="(card, index) in this.cards"
                        :key="`hand-card-${index}`"
                        :card="card"
                        :index="index"
                        :is-ghost="true"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">


import './ghost-hand.scss';

import Vue from 'vue';

    import CardComponent from '../card/CardComponent.vue';
import { CardUI } from '../../card-ui';
import { UIPosition } from '../../../ui-position';



const GhostHandComponent = Vue.extend ({

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
    data() {

        let values = {};

        return values;

    },
   components: {
        'card-component': CardComponent
    },
    computed: {


    },
    methods: {

        cardCreated(card: CardUI) {

            console.log(`Showing ghost card for ${card.index}`)
            card.top = 5;
            card.left = 50 + (card.index * 50);
            card.isFacedown = false;

        }

    }

});

export default GhostHandComponent;

</script>
