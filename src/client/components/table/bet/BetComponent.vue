<template>
    <div v-if="bet.totalBet > 0" :class="betClasses">
        {{ ui.chipFormatter.format(bet.totalBet) }}
    </div>
</template>


<script lang="ts">


import './bet.scss';

import Vue from 'vue';

import { Bet } from '../../../../casino/tables/betting/bet';
import { TableUI } from '../../../table-ui';

const BetComponent = Vue.extend ({

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
    data() {

        let values =
        {
            isAnnounced: false,
            timer: ''
        };

        return values;

    },
    created() {


        console.log(`Created BetComponent for seatIndex ${this.bet.seatIndex}, amount ${this.bet.totalBet}`);

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
