<template>
    <div :class="getClasses">
        {{ winningHandDescription }}
    </div>
</template>


<script lang="ts">


    import './winning-hand.scss';

    import { defineComponent, computed, ref, onMounted } from 'vue';
    import { tableState } from '@/store/table-state';

    const WinningHandComponent = defineComponent ({

        setup() {

            const isAnnounced = ref(false);
            const timer = ref(null as ReturnType<typeof setTimeout>);

            const winningHandDescription = computed(() => tableState.getWinningHand.value);

            const getClasses = computed((): string[] => {

                let classes: string[] = ['winning-hand'];

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

                winningHandDescription,
                getClasses,

                isAnnounced,
                timer

            };

        },

    });

    export default WinningHandComponent;

</script>
