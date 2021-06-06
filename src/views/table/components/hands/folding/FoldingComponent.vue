<template>
    <div class="hand">
        <card-component v-for="(card, index) in this.cards"
                        :key="`folding-card-${index}`"
                        :card="card"
                        :index="index"
                        :is-folding="true"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">

    import './folding.scss';

    import { defineComponent, computed } from 'vue';

    import { UIPosition } from '@/app/ui/ui-position';
    import CardComponent from '../../cards/card/CardComponent.vue';
    import { CardUI } from '../../cards/card-ui';
import { handPositionCalculator } from '../hand-position-calculator';


    const FoldingComponent = defineComponent({

    props: {
        cards: {
            type: Array,
            required: true
        },
        dealerPosition: {
            type: UIPosition,
            required: true
        }

        },
        setup(props) {

            const cardCreated = (card: CardUI): void => {

                console.log(`Starting folding animation for ${card.index}`)

                card.top = computed(() => handPositionCalculator.calculateHoldingTop(card.index, props.cards.length));
                card.left = computed(() => handPositionCalculator.calculateHoldingLeft(card.index, props.cards.length));
                card.isFacedown = false;

                // After only the briefest of pauses, we're going to mark this card as "mucked", so it goes flying towards the dealer
                setTimeout(() => {

                    card.top = computed(() => props.dealerPosition.top);
                    card.left = computed(() => props.dealerPosition.left);
                    card.isFacedown = true;

                    // After we have given the card time to reach the dealer, then zap it
                    setTimeout(() => {

                        card.top = card.left = computed(() => null);

                    }, 300)

                }, 10);

            };

            return {

                cardCreated

            }


        },
       components: {
            CardComponent
        }

    });

    export default FoldingComponent;

</script>
