<template>

    <div class="pot" :class="potClasses">
        <chip-box-component :value="pot.amount"></chip-box-component>
        <div class="amount">{{ chipFormatter.format(pot.amount) }}</div>
        <div class="name">{{ pot.getName() }}</div>
    </div>

</template>


<script lang="ts">


import './pot.scss';

    import { defineComponent, computed, ref, onMounted } from 'vue';

    import { Pot } from '@/app/casino/tables/betting/pot';

    import ChipBoxComponent from '../chips/ChipBoxComponent.vue';
    import { tableState } from '@/store/table-state';

    const PotComponent = defineComponent({

        props: {
            pot: {
                type: Pot,
                required: true
            },
        },
        setup(props) {

            const isGathered = ref(false);
            const timer = ref(null as ReturnType<typeof setTimeout>);

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const potClasses = computed((): string[] => {

                if (!props.pot) {
                    return null;
                }

                let classes: string[] = [`pot-${props.pot.index}`];

                if (isGathered.value) {

                    classes.push('gathered');

                }

                return classes;

            });

            onMounted(() => {

                // After only the briefest of pauses, we're going to have this pot appear
                timer.value = setTimeout(() => {

                    isGathered.value = true;

                }, 10);


            });


            return {

                chipFormatter,

                potClasses

            };

        },
        components: {

            ChipBoxComponent

        }

    });

export default PotComponent;

</script>
