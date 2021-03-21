<template>

    <div class="chip-box">
        <chip-component v-for="(chip, index) in chips"
                        :key="`chip-${index}`"
                        :chip="chip"
                        :top="getChipTop(index)"
                        :left="getChipLeft(index)"
                        :is-angled="angleChips"></chip-component>
    </div>

</template>


<script lang="ts">


    import './chip-box.scss';

    import { defineComponent, computed, ref, watch } from 'vue';

    import { Chip } from '@/app/casino/tables/chips/chip';
    import { stackChips } from '@/app/casino/tables/chips/chip-stacker';
    import { UIPosition } from '@/app/ui/ui-position';
    import ChipComponent from './ChipComponent.vue';

    const ChipBoxComponent = defineComponent({

        props: {

            value: {
                type: Number,
                required: true
            },
            chipPosition: {
                type: UIPosition,
                required: false
            }

        },
        setup(props) {

            let lastChipReleased = ref(null as number);

            const chips = computed((): Chip[] => {

                // chipStacker.colorUp returns an array of ChipStack objects, each of which represents a chip type and a number of them...
                // of chips
                return stackChips(props.value)
                    // ...we will map (reduce) that number to an actual array of that number.
                    // This will result in an Array<Chip>
                    .reduce((chips, stack) => { for (let ix: number = 0; ix < stack.count; ix++) { chips.push(stack.chip); } return chips; }, []);

            });


            const angleChips = computed((): boolean => props.chipPosition == null);

            const getChipTop = (index: number): number => {

                return (props.chipPosition && lastChipReleased.value <= index) ? props.chipPosition.top : -20 - (index * 3);

            };

            const getChipLeft = (index: number): number => {

                return (props.chipPosition && lastChipReleased.value <= index) ? props.chipPosition.left : 30;

            };

            const releaseChip = (): void => {

                lastChipReleased.value = (lastChipReleased.value == null) ? chips.value.length - 1 : (lastChipReleased.value - 1);

                if (lastChipReleased.value > 0) {

                    setTimeout(() => { releaseChip(); }, 100);

                };

            };

            watch(() => props.chipPosition, (newValue: UIPosition, oldValue: UIPosition) => {

                if (newValue) {
                    releaseChip();
                }

            });

            return {

                lastChipReleased,
                chips,
                angleChips,

                getChipTop,
                getChipLeft,
                releaseChip

            };

        },
        components: {
            ChipComponent
        }

    });

export default ChipBoxComponent;

</script>
