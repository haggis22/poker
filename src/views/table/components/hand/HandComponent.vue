<template>
    <div class="hand">
        <card-component v-for="(card, index) in this.cards"
                        :key="`hand-card-${index}`"
                        :card="card"
                        :index="index"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">


import './hand.scss';

    import { defineComponent } from 'vue';

    import { UIPosition } from '@/app/ui/ui-position';

    import CardComponent from '../card/CardComponent.vue';
    import { CardUI } from '../../card-ui';



    const HandComponent = defineComponent({

        props: {
            cards: {
                type: Array,
                required: true
            },
            dealerPosition: {
                type: UIPosition,
                required: true
            },

        },
        setup(props) {

            const cardCreated = (card: CardUI): void => {

                if (card.isDealing) {

                    console.log(`Starting dealing animation for ${card.index}`)
                    card.top = props.dealerPosition.top;
                    card.left = props.dealerPosition.left;
                    card.isFacedown = true;

                    // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
                    setTimeout(() => {

                        card.top = calculateFinalTop(card);
                        card.left = calculateFinalLeft(card);
                        card.isFacedown = false;

                    }, 10);

                }
                else {

                    card.top = calculateFinalTop(card);
                    card.left = calculateFinalLeft(card);

                }

            };

            return {

                cardCreated

            };

        },
        components: {
            CardComponent
        },

    });

    function calculateFinalTop(card: CardUI): number {

        return 5;

    }

    function calculateFinalLeft(card: CardUI): number {

        return 50 + (card.index * 50);

    }


    export default HandComponent;

</script>
