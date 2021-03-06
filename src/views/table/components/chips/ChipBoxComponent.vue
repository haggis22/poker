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

import Vue from 'vue';

import { ChipStacker } from '../../../../casino/tables/chips/chip-stacker';
import ChipComponent from './ChipComponent.vue';
import { UIPosition } from '../../../ui-position';


const ChipBoxComponent = Vue.extend ({

    props: {
        value: {
            type: Number,
            required: true
        },
        chipStacker: {
            type: ChipStacker,
            required: true
        },
        chipPosition: {
            type: UIPosition,
            required: false
        }
    },
    watch: {

        chipPosition: function (newValue, oldValue) {

            if (newValue) {

                this.releaseChip();

            }

        }

    },
    data() {

        let values = {

            lastChipReleased: null

        };

        return values;

    },
    components: {
        'chip-component': ChipComponent
    },
    computed: {

        chips: function () {

            // chipStacker.colorUp returns an array of ChipStack objects, each of which represents a chip type and a number of them...
            // of chips
            return this.chipStacker.colorUp(this.value)
                // ...we will map (reduce) that number to an actual array of that number.
                // This will result in an Array<Chip>
                .reduce((chips, stack) => { for (let ix: number = 0; ix < stack.count; ix++) { chips.push(stack.chip); } return chips; }, []);

        },
        angleChips: function (): boolean {

            return this.chipPosition == null;

        }

    },
    methods: {

        getChipTop(index: number): number {

            return (this.chipPosition && this.lastChipReleased <= index) ? this.chipPosition.top : -20 - (index * 3);

        },
        getChipLeft(index: number): number {

            return (this.chipPosition && this.lastChipReleased <= index) ? this.chipPosition.left : 30;

        },
        releaseChip(): void {

            this.lastChipReleased = (this.lastChipReleased == null) ? this.chips.length - 1 : (this.lastChipReleased - 1);

            if (this.lastChipReleased > 0) {

                setTimeout(() => { this.releaseChip(); }, 100);

            }

        }

    }

});

export default ChipBoxComponent;

</script>
