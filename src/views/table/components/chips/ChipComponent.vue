<template>

    <div :class="chipClasses" :style="{ 'background-color': chip.color, 
                                        'border-color': chip.accentColor,
                                        'top': `${top}px`,
                                        'left': `${left}px` }"></div>

</template>


<script lang="ts">


import './chip.scss';

    import { defineComponent } from 'vue';

import { Chip } from '@/app/casino/tables/chips/chip';


    const ChipComponent = defineComponent({

    props: {
        chip: {
            type: Chip,
            required: true
        },
        top: {
            type: Number,
            required: true
        },
        left: {
            type: Number,
            required: true
        },
        isAngled: {
            type: Boolean,
            required: false
        }

    },
    computed: {

        chipClasses: function () {

            let classes: string[] = ['poker-chip'];

            if (this.isAngled) {

                classes.push('angled');

            }

            return classes;

        }

    }

});

export default ChipComponent;

</script>
