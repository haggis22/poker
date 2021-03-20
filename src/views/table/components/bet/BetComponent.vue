<template>
    <div v-if="bet.totalBet > 0" :class="betClasses">
        <chip-box-component :value="bet.totalBet"
                            :chip-stacker="ui.chipStacker"></chip-box-component>
        <div class="amount">{{ chipFormatter.format(bet.totalBet) }}</div>
    </div>
</template>


<script lang="ts">

import './bet.scss';

import { defineComponent, computed } from "vue";

import { Bet } from '@/app/casino/tables/betting/bet';
import { TableUI } from '../../table-ui';
import ChipBoxComponent from '../chips/ChipBoxComponent.vue';
import { tableState } from '@/store/table-state';

const BetComponent = defineComponent ({

    props: {
        bet: {
            type: Bet,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    setup() {

        const chipFormatter = computed(() => tableState.getChipFormatter.value);


        return {

            chipFormatter

        };

    },
    components: {
        'chip-box-component': ChipBoxComponent
    },
    data() {

        let values =
        {
            isAnnounced: false,
            timer: null as ReturnType<typeof setTimeout>
        };

        return values;

    },
    created() {

        // After only the briefest of pauses, we're going to have this bubble appear
        this.timer = setTimeout(() => {

            this.isAnnounced = true;

        }, 10);

    },
    computed: {

        betClasses: function () {

            if (!this.bet) {
                return null;
            }

            let classes: string[] =
                [
                    'chips-stage'
                ];

            switch (this.bet.betType) {
                case Bet.TYPE.ANTE:
                    classes.push('ante');
                    classes.push(this.ui.isGatheringAntes ? 'gathering' : `seat-${this.bet.seatIndex}`);
                    break;

                case Bet.TYPE.BLIND:
                case Bet.TYPE.REGULAR:
                    classes.push('bet');
                    classes.push(this.ui.isGatheringBets ? 'gathering' : `seat-${this.bet.seatIndex}`);
                    break;
            }

            if (this.isAnnounced) {

                classes.push('announced');

            }

            return classes;

        }

    }

});

    export default BetComponent;

</script>
