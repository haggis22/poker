<template>
    <div class="chips-stage" :class="[ 'seat-'+seatIndex ]">
        <div class="action">{{ bet.getTypeName() }}</div>
        <div v-if="bet.totalBet > 0" class="amount">{{ ui.chipFormatter.format(bet.totalBet) }}</div>
    </div>
</template>


<script lang="ts">


import './bet.scss';

import Vue from 'vue';

import { Bet } from '../../../../casino/tables/betting/bet';
    import { TableUI } from '../../../table-ui';

const BetComponent = Vue.extend ({

    props: {
        seatIndex: {
            type: Number,
            required: true
        },
        bet: {
            type: Bet,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },

});

export default BetComponent;

</script>
