<template>

    <button type="button" class="bet-button" @click="$emit('button-click')">
        <div :class="lightClasses"></div>
        <div class="text">
            <div class="action">{{ action }}</div>
            <div v-if="amount" class="amount">{{ chipFormatter.format(amount) }}</div>
        </div>
    </button>

</template>


<script lang="ts">
    
import './bet-button.scss';

    import { defineComponent } from "vue";

    import { MoneyFormatter } from "@/app/casino/tables/chips/money-formatter";



    const BetButtonComponent = defineComponent({

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
