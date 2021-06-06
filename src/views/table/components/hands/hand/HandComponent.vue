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

    import { defineComponent, computed } from 'vue';

    import { UIPosition } from '@/app/ui/ui-position';
    import CardComponent from '../../cards/card/CardComponent.vue';
    import { CardUI } from '../../cards/card-ui';
import { handPositionCalculator } from '../hand-position-calculator';


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
                    card.top = computed(() => props.dealerPosition.top);
                    card.left = computed(() => props.dealerPosition.left);
                    card.isFacedown = true;

                    // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
                    setTimeout(() => {

                        card.top = computed(() => handPositionCalculator.calculateHoldingTop(card.index, props.cards.length));
                        card.left = computed(() => handPositionCalculator.calculateHoldingLeft(card.index, props.cards.length));
                        card.isFacedown = false;

                    }, 10);

                }
                else {

                    card.top = computed(() => handPositionCalculator.calculateHoldingTop(card.index, props.cards.length));
                    card.left = computed(() => handPositionCalculator.calculateHoldingLeft(card.index, props.cards.length));

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



    export default HandComponent;

</script>
