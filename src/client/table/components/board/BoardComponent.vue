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
            switch (card.index) {

                case 0:
                case 1:
                case 2:
                    setTimeout(() => { animateFlop(card) }, 100);
                    break;

                default:
                    setTimeout(() => { animateOthers(card) }, 100);
                    break;

            }

        }

    }


});

    function animateFlop(card: CardUI): void {

        card.top = 12;
        card.left = 10;

        setTimeout(() => {

            card.isFacedown = false;

            setTimeout(() => {

                card.left = 25 + (card.index * 60);

            }, 300);

        }, 300);


    }


    function animateOthers(card: CardUI): void {

        card.top = 12;
        card.left = 25 + (card.index * 60);

        setTimeout(() => {

            card.isFacedown = false;

        }, 100);


    }


export default BoardComponent;

</script>
