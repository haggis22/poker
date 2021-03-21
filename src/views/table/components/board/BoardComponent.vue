<template>
    <div class="board" :class="boardClasses">
        <card-component v-for="(card, index) in board.cards"
                        :key="`card-${index}`"
                        :card="card"
                        :index="index"
                        :is-used="ui.isCardUsed(card)"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">

    import './board.scss';

    import { defineComponent, computed } from 'vue';

    import { Board } from '@/app/casino/tables/boards/board';
    import { UIPosition } from '@/app/ui/ui-position';
    import { CardUI } from '../../card-ui';
    import { TableUI } from '../../table-ui';
    import CardComponent from '../card/CardComponent.vue';
    import { tableState } from '@/store/table-state';


    const BoardComponent = defineComponent({

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
        setup(props) {

            const dealerPosition = new UIPosition(245, 158);

            const boardClasses = computed((): string[] => {

                let classes = [];

                if (tableState.getShowdownRequired.value) {

                    classes.push('showdown');

                }

                return classes;

            });

            const cardCreated = (card: CardUI): void => {

                console.log(`Starting animation for ${card.index}`)
                card.top = dealerPosition.top;
                card.left = dealerPosition.left;
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

                }  // switch

            };


            return {

                dealerPosition,
                boardClasses,
                cardCreated

            };

        },
        components: {
            'card-component': CardComponent
        },

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

        }, 200);


    }


export default BoardComponent;

</script>
