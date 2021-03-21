<template>
    <div v-if="bet.totalBet > 0" :class="betClasses">
        <chip-box-component :value="bet.totalBet"></chip-box-component>
        <div class="amount">{{ chipFormatter.format(bet.totalBet) }}</div>
    </div>
</template>


<script lang="ts">

import './bet.scss';

    import { defineComponent, computed, ref, onMounted } from "vue";

    import { Bet } from '@/app/casino/tables/betting/bet';
    import { TableUI } from '../../table-ui';
    import ChipBoxComponent from '../chips/ChipBoxComponent.vue';
    import { tableState } from '@/store/table-state';

    const BetComponent = defineComponent ({

        props: {
            bet: {
                type: Bet,
                required: true
            }
        },
        setup(props) {

            const isAnnounced = ref(false);
            const timer = ref(null as ReturnType<typeof setTimeout>);

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const betClasses = computed(() => {

                if (!props.bet) {
                    return null;
                }

                let classes: string[] =
                    [
                        'chips-stage'
                    ];

                switch (props.bet.betType) {

                    case Bet.TYPE.ANTE:
                        classes.push('ante');
                        classes.push(tableState.getGatheringAntes.value ? 'gathering' : `seat-${props.bet.seatIndex}`);
                        break;

                    case Bet.TYPE.BLIND:
                    case Bet.TYPE.REGULAR:
                        classes.push('bet');
                        classes.push(tableState.getGatheringBets.value ? 'gathering' : `seat-${props.bet.seatIndex}`);
                        break;
                }

                if (isAnnounced.value) {

                    classes.push('announced');

                }

                return classes;

            });

            onMounted(() => {

                // After only the briefest of pauses, we're going to have this bubble appear
                timer.value = setTimeout(() => {

                    isAnnounced.value = true;

                }, 10);

            });


            return {

                isAnnounced,
                timer,

                chipFormatter,
                betClasses

            };

        },
        components: {
            ChipBoxComponent
        },

    });

    export default BetComponent;

</script>
