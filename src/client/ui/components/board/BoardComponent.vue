<template>
    <div class="board">
        <div class="cards">
            <card-component v-for="(card, index) in board.cards"
                            :key="`card-${index}`"
                            :card="card"></card-component>
        </div>
    </div>
</template>


<script lang="ts">


import './board.scss';

import Vue from 'vue';

import { TableUI } from '../../../table-ui';

import CardComponent from '../card/CardComponent';
import { Board } from '../../../../casino/tables/boards/board';

const BoardComponent = Vue.extend ({

    props: {
        board: {
            type: Object as () => Board,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }
    },
    components: {
        'card-component': CardComponent
    },
    computed: {

        seatClasses: function () {

            let classes = [];
            /*
            [`seat-${this.seat.index}`];

            if (this.betTracker && this.betTracker.seatIndex == this.seat.index) {

                classes.push('action-on');

            }

            if (this.seat.player && this.seat.player.isSittingOut) {
                classes.push('sitting-out');
            }
            */
            return classes;

        }

    }

});

export default BoardComponent;

</script>
