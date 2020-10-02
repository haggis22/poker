<template>
    <div class="chips-stage" :class="betClasses">
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

            let classes: string[] = [];

            if (this.isAnnounced) {

                classes.push('announced');

            }

            if (this.ui.isGatheringBets) {

                classes.push('gathering');

            }
            else {

                classes.push(`seat-${this.bet.seatIndex}`);


            }

            return classes;

        }

    }

});

export default BetComponent;

</script>
