<template>

    <button type="button" @click="$emit('button-click')">
        <div :class="lightClasses"></div>
        <div class="text">
            <div class="action">{{ action }}</div>
            <div v-if="amount" class="amount">{{ chipFormatter.format(amount) }}</div>
        </div>
    </button>

</template>


<script lang="ts">
    
import './bet-button.scss';

    import Vue from 'vue';

import { MoneyFormatter } from '../../../../casino/tables/chips/money-formatter';


const BetButtonComponent = Vue.extend ({

    props: {

        action: {
            type: String,
            required: true
        },
        isActivated: {
            type: Boolean,
            required: true
        },
        amount: {
            type: Number,
            required: false
        },
        chipFormatter: {
            type: MoneyFormatter,
            required: false
        }

    },
    computed: {

        lightClasses: function () {

            let classes = [ 'light' ];

            if (this.isActivated) {

                classes.push('activated');

            }

            return classes;

        },

    }

});

    export default BetButtonComponent;

</script>
