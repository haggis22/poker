<template>

    <button type="button" class="bet-button" @click="$emit('button-click')" :disabled="disabled">
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
            },
            disabled: {
                type: Boolean,
                required: false
            }

        },
        setup(props) {

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const lightClasses = computed((): string[] => {

                let classes = ['light'];

                if (props.disabled) {

                    classes.push('disabled');

                }

                // Can't be disabled *and* activated
                else if (props.isActivated) {

                    classes.push('activated');

                }

                return classes;

            });


            return {

                chipFormatter,

                lightClasses

            };


        },

    });

    export default BetButtonComponent;

</script>
