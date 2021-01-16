<template>
    <div class="board" :class="boardClasses">
        <div class="cards">
            <card-component v-for="(card, index) in board.cards"
                            :key="`card-${index}`"
                            :card="card"
                            :ui="ui"></card-component>
        </div>
    </div>
</template>


<script lang="ts">


import './board.scss';

import Vue from 'vue';

    import { TableUI } from '../../table-ui';

import CardComponent from '../card/CardComponent.vue';
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

        boardClasses: function () {

            let classes = [];

            if (this.ui.isShowdownRequired) {

                classes.push('showdown');

            }

            return classes;

        }

    }

});

export default BoardComponent;

</script>
