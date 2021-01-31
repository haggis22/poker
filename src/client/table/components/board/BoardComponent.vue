<template>
    <div class="board" :class="boardClasses">
        <card-component v-for="(card, index) in board.cards"
                        :key="`card-${index}`"
                        :card="card"
                        :index="index"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">


import './board.scss';

import Vue from 'vue';

    import { TableUI } from '../../table-ui';

import CardComponent from '../card/CardComponent.vue';
import { Board } from '../../../../casino/tables/boards/board';
import { UIPosition } from '../../../ui-position';
import { CardUI } from '../../card-ui';


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
    data() {

        let values = {

            dealerPosition: new UIPosition(245, 158)

        };

        return values;

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

    },
    methods: {

        cardCreated(card: CardUI) {

            console.log(`Starting animation for ${card.index}`)
            card.top = this.dealerPosition.top;
            card.left = this.dealerPosition.left;
            card.isFacedown = true;

            // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
            setTimeout(() => {

                card.top = 12;
                card.left = 25 + (card.index * 60);
                card.isFacedown = false;

            }, 300);

        }

    }


});

export default BoardComponent;

</script>
