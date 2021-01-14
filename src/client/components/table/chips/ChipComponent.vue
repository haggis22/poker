<template>

    <div :class="chipClasses" :style="{ 'background-color': chip.color, 
                                        'border-color': chip.accentColor,
                                        'grid-row': row,
                                        'grid-column': column }"></div>

</template>


<script lang="ts">


import './chip.scss';

import Vue from 'vue';

import { Chip } from '../../../../casino/tables/chips/chip';


const ChipComponent = Vue.extend({

    props: {
        chip: {
            type: Chip,
            required: true
        },
        row: {
            type: Number,
            required: true
        },
        column: {
            type: Number,
            required: true
        }

    },
    computed: {

        chipClasses: function () {

            let classes: string[] = ['poker-chip'];

            return classes;

        }

    }

});

export default ChipComponent;

</script>
