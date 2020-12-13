<template>
    <div :class="classes">
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

            if (this.localTimer) {

                return this.localTimer.percentRemaining() + '%';

            }

            return '0';

        },

        classes: function () {

            let classes = [ 'timer' ];

            if (this.localTimer && this.localTimer.percentRemaining() < 20) {

                classes.push('danger');

            }

            return classes;

        }

    }

});

export default TimerComponent;

</script>
