<template>

    <button type="button" 
                :class="buttonClasses" 
                @click="tryClick()" 
                :disabled="disabled">
        <div :class="lightClasses"></div>
        <div class="text">
            <div class="action">{{ action }}</div>
            <div v-if="amount" class="amount">{{ chipFormatter.format(amount) }}</div>
        </div>
    </button>

</template>


<script lang="ts">
    
import './bet-button.scss';

    import { defineComponent, computed, ref, onMounted } from "vue";

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
            },
            requiresDelay: {
                type: Boolean,
                required: false
            }

        },
        setup(props, context) {

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const isClickable = ref(!props.requiresDelay);

            const buttonClasses = computed((): string[] => {

                const classes = ['bet-button'];

                if (!isClickable.value) {

                    classes.push('not-clickable');

                }

                return classes;

            });

            const lightClasses = computed((): string[] => {

                const classes = ['light'];

                if (props.disabled) {

                    classes.push('disabled');

                }

                // Can't be disabled *and* activated
                else if (props.isActivated) {

                    classes.push('activated');

                }

                return classes;

            });

            const tryClick = () => {

                if (isClickable.value) {

                    context.emit('button-click');

                }

            }

            onMounted(() => {

                setTimeout(() => { isClickable.value = true; }, 400);

            });


            return {

                chipFormatter,

                isClickable,
                tryClick,

                buttonClasses,
                lightClasses

            };


        },

    });

    export default BetButtonComponent;

</script>
