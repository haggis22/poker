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

    import { defineComponent, computed } from "vue";

    import { MoneyFormatter } from "@/app/casino/tables/chips/money-formatter";
    import { tableState } from '@/store/table-state';


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
        }

        },
        setup() {

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            return {

                chipFormatter

            };


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
