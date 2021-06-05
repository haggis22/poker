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

    import { defineComponent, computed, ref } from 'vue';

    import { Board } from '@/app/casino/tables/boards/board';
    import { UIPosition } from '@/app/ui/ui-position';
    import { CardUI } from '../../card-ui';
    import CardComponent from '../card/CardComponent.vue';
    import { tableState } from '@/store/table-state';


    const BoardComponent = defineComponent({

        props: {

            board: {
                type: Object as () => Board,
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

                if (card.isDealing) {

                    console.log(`Starting animation for ${card.index}`)
                    card.top = computed(() => dealerPosition.top);
                    card.left = computed(() => dealerPosition.left);
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

                }
                else {

                    // no animation - just put the card in place
                    card.top = computed(() => calculateFinalTop(card));
                    card.left = computed(() => calculateFinalLeft(card));

                }


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


    function calculateFinalTop(card: CardUI): number {

        return 12;

    }

    function calculateFinalLeft(card: CardUI): number {

        return 25 + (card.index * 60);

    }


    function animateFlop(card: CardUI): void {

        card.top = computed(() => calculateFinalTop(card));
        card.left = computed(() => 10);

        setTimeout(() => {

            card.isFacedown = false;

            setTimeout(() => {

                card.left = computed(() => calculateFinalLeft(card));

            }, 300);

        }, 300);


    }


    function animateOthers(card: CardUI): void {

        card.top = computed(() => calculateFinalTop(card));
        card.left = computed(() => calculateFinalLeft(card));

        setTimeout(() => {

            card.isFacedown = false;

        }, 200);


    }


export default BoardComponent;

</script>
