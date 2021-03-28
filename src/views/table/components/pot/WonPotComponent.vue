<template>

    <div class="pot gathered" :class="potClasses">
        <chip-box-component :value="pot.amount" :chip-position="chipPosition"></chip-box-component>
        <div class="amount">{{ chipFormatter.format(pot.amount) }}</div>
        <div class="name">{{ pot.getName() }}</div>
    </div>

</template>


<script lang="ts">

import './pot.scss';

    import { defineComponent, computed, ref, onMounted } from 'vue';

    import { WonPot } from '@/app/casino/tables/betting/won-pot';
    import { UIPosition } from '@/app/ui/ui-position';

    import ChipBoxComponent from '../chips/ChipBoxComponent.vue';
    import { tableState } from '@/store/table-state';

    const WonPotComponent = defineComponent({

        props: {
            pot: {
                type: WonPot,
                required: true
            }
        },
        setup(props) {

            const isPushed = ref(false);
            const timer = ref(null as ReturnType<typeof setTimeout>);

            // this will specify where the chips will eventually end up
            const chipPosition = ref(null as UIPosition);

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const playerPosition = computed(() => tableState.getPlayerPosition(props.pot.seatIndex));

            const potClasses = computed(() => {

                if (!props.pot) {
                    return null;
                }

                let classes: string[] = [`pot-${props.pot.index}`];

                if (isPushed.value) {

                    classes.push('pushed');
                    classes.push(`seat-${props.pot.seatIndex}`);

                }

                return classes;

            });

            onMounted(() => {

                console.log(`Created WonPotComponent for pot index ${props.pot.index}, amount ${props.pot.amount}`);

                // After only the briefest of pauses, we're going to start pushing this pot towards its winner
                timer.value = setTimeout(() => {

                    isPushed.value = true;

                    // start the chips flying at the player
                    setTimeout(() => {

                        chipPosition.value = playerPosition.value;

                    }, 1000);

                }, 10);

            });

            return {

                isPushed,
                timer,

                potClasses,
                chipPosition,

                chipFormatter

            };

        },
        components: {
            ChipBoxComponent
        },

    });

    export default WonPotComponent;

</script>
