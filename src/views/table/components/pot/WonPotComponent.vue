<template>

    <div class="pot gathered" :class="potClasses">
        <chip-box-component :value="pot.amount"
                            :chip-stacker="ui.chipStacker"
                            :chip-position="chipPosition"></chip-box-component>
        <div class="amount">{{ ui.chipFormatter.format(pot.amount) }}</div>
        <div class="name">{{ pot.getName() }}</div>
    </div>

</template>


<script lang="ts">

import './pot.scss';

    import { defineComponent } from 'vue';

import { WonPot } from '@/app/casino/tables/betting/won-pot';
    import { UIPosition } from '@/app/ui/ui-position';

    import { TableUI } from '../../table-ui';
import ChipBoxComponent from '../chips/ChipBoxComponent.vue';

    const WonPotComponent = defineComponent({

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
            timer: null as ReturnType<typeof setTimeout>

            // this will specify where the chips will eventually end up
            playerPosition: this.ui.playerPositions.get(this.pot.seatIndex),
            chipPosition: null as UIPosition
        };

        return values;

    },
    created() {

        console.log(`Created WonPotComponent for pot index ${this.pot.index}, amount ${this.pot.amount}`);

        // After only the briefest of pauses, we're going to start pushing this pot towards its winner
        this.timer = setTimeout(() => {

            this.isPushed = true;

            // start the chips flying at the player
            setTimeout(() => {

                this.chipPosition = this.playerPosition;

            }, 1000);

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
