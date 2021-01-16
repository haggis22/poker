<template>

    <div class="chip-box" :style="{ 'grid-template-rows': `repeat(${chips.length}, 3px)`, 'height': `${(chips.length * 3) + 24}px` }">
        <chip-component v-for="(chip, index) in chips"
                        :key="`chip-${index}`"
                        :chip="chip"
                        :column="1"
                        :row="((chips.length - index) + 1)"></chip-component>
    </div>

</template>


<script lang="ts">


import './chip-box.scss';

import Vue from 'vue';

import { ChipStacker } from '../../../../casino/tables/chips/chip-stacker';
import ChipComponent from './ChipComponent.vue';


const ChipBoxComponent = Vue.extend ({

    props: {
        value: {
            type: Number,
            required: true
        },
        chipStacker: {
            type: ChipStacker,
            required: true
        }
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

        }

    }

});

export default ChipBoxComponent;

</script>
