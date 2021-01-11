<template>

    <div :class="chipClasses" :style="{ 'background-color': chip.color, 'border-color': chip.accentColor }"></div>

</template>


<script lang="ts">


import './chip.scss';

import Vue from 'vue';

import { Chip } from '../../../../casino/tables/chips/chip';


const ChipComponent = Vue.extend ({

    props: {
        chip: {
            type: Chip,
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
