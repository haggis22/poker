<template>
    <div :class="classes">
        <div class="mercury" :style="{ width: width }"></div>
    </div>
</template>


<script lang="ts">

    import './timer.scss';

    import { defineComponent, computed } from 'vue';

    import { Timer } from '@/app/timers/timer';

    const TimerComponent = defineComponent ({

        props: {
            timer: {
                type: Timer,
                required: true
            }
        },
        setup(props) {

            const timer = props.timer;

            let width = computed((): string => {

                return timer.percentRemaining + '%';

            });

            let classes = computed((): string[] => {

                const classes = ['timer'];

                if (timer.percentRemaining < 20) {

                    classes.push('danger');

                }

                return classes;

            });

            return {

                width,
                classes

            }


        },

        unmounted() {

        }

    });

    export default TimerComponent;

</script>
