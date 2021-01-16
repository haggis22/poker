<template>

    <div class="pot gathered" :class="potClasses">
        <chip-box-component :value="pot.amount"
                            :chip-stacker="ui.chipStacker"></chip-box-component>
        <div class="amount">{{ ui.chipFormatter.format(pot.amount) }}</div>
        <div class="name">{{ pot.getName() }}</div>
    </div>

</template>


<script lang="ts">

import './pot.scss';

import Vue from 'vue';

import { WonPot } from '../../../../casino/tables/betting/won-pot';
    import { TableUI } from '../../table-ui';
import ChipBoxComponent from '../chips/ChipBoxComponent.vue';

const WonPotComponent = Vue.extend ({

    props: {
        pot: {
            type: WonPot,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    components: {
        'chip-box-component': ChipBoxComponent
    },
    data() {

        let values =
        {
            isPushed: false,
            timer: ''
        };

        return values;

    },
    created() {

        console.log(`Created WonPotComponent for pot index ${this.pot.potIndex}, amount ${this.pot.amount}`);

        // After only the briefest of pauses, we're going to start pushing this pot towards its winner
        this.timer = setTimeout(() => {

            this.isPushed = true;

        }, 10);

    },
    computed: {

        potClasses: function () {

            if (!this.pot) {
                return null;
            }

            let classes: string[] = [`pot-${this.pot.index}`];

            if (this.isPushed) {

                classes.push('pushed');
                classes.push(`seat-${this.pot.seatIndex}`);

            }

            return classes;

        }

    }

});

export default WonPotComponent;

</script>
