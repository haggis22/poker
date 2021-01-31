<template>
    <div class="hand">
        <card-component v-for="(card, index) in cards"
                        :key="`card-${index}`"
                        :card="card"
                        :index="index"
                        :start-dealing="startDealing"
                        :start-mucking="startMucking"
                        :is-showdown="ui.isShowdownRequired"
                        :dealer-position="ui.dealerPositions.get(seatIndex)"
                        :is-used="ui.isCardUsed(card)"></card-component>
    </div>
</template>


<script lang="ts">


import './hand.scss';

import Vue from 'vue';

import { TableUI } from '../../table-ui';
    import CardComponent from '../card/CardComponent.vue';

const HandComponent = Vue.extend ({

    props: {
        seatIndex: {
            type: Number,
            required: true
        },
        cards: {
            type: Array,
            required: true
        },
        startDealing: {
            type: Boolean,
            required: true
        },
        startMucking: {
            type: Boolean,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    components: {
        'card-component': CardComponent
    },
    computed: {


    },

});

export default HandComponent;

</script>
