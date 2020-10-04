<template>

    <div class="pot" :class="potClasses">
        <div class="name">{{ pot.getName() }}</div>
        <div class="chips">{{ ui.chipFormatter.format(pot.amount) }}</div>
    </div>

</template>


<script lang="ts">


import './pot.scss';

import Vue from 'vue';

import { Pot } from '../../../../casino/tables/betting/pot';
import { TableUI } from '../../../table-ui';

const PotComponent = Vue.extend ({

    props: {
        pot: {
            type: Pot,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    data() {

        let values =
        {
            isGathered: false,
            timer: ''
        };

        return values;

    },
    created() {

        console.log(`Created PotComponent for index ${this.pot.index}, amount ${this.pot.amount}`);

        // After only the briefest of pauses, we're going to have this pot appear
        this.timer = setTimeout(() => {

            this.isGathered = true;

        }, 10);

    },
    computed: {

        potClasses: function () {

            if (!this.pot) {
                return null;
            }

            let classes: string[] = [`pot-${this.pot.index}`];

            if (this.isGathered) {

                classes.push('gathered');

            }

            return classes;

        }

    }

});

export default PotComponent;

</script>
