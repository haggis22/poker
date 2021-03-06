<template>
    <div :class="classes">
        <div class="mercury" :style="{ width: width }"></div>
    </div>
</template>


<script lang="ts">

    import './timer.scss';

    import { defineComponent } from 'vue';

    import { Timer } from '@/app/timers/timer';

    const TimerComponent = defineComponent ({

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

        width: function (): string {

            if (this.localTimer) {

                return this.localTimer.percentRemaining() + '%';

            }

            return '0';

        },

        classes: function (): Array<string> {

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
