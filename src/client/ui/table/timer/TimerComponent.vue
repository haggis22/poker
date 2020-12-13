<template>
    <div class="timer">
        <div>{{ localTimer.timeRemaining }}</div>

        <div class="mercury" :style="{ width: width }"></div>
    </div>
</template>


<script lang="ts">

import './timer.scss';

import Vue from 'vue';

import { Timer } from '../../../../timers/timer';

const TimerComponent = Vue.extend ({

    props: {
        timer: {
            type: Timer,
            required: true
        }
    },

    data() {

        let values =
        {
            localTimer: this.timer
        };

        return values;

    },

    computed: {

        width: function () {

            if (this.localTimer && this.localTimer.totalTime) {

                return (100 * this.localTimer.timeRemaining / this.localTimer.totalTime) + '%';

            }

            return '0';

        },


        maxValue: function () {

            if (this.timer && this.timer.totalTime) {

                return this.timer.totalTime;

            }

            return 0;

        },

        currentValue: function () {

            if (this.timer && this.timer.timeRemaining) {

                return this.timer.timeRemaining;

            }

            return 0;

        }

    }

});

export default TimerComponent;

</script>
