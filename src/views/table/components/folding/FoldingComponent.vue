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

    import { defineComponent } from 'vue';

    import { UIPosition } from '@/app/ui/ui-position';
    import CardComponent from '../card/CardComponent.vue';
    import { CardUI } from '../../card-ui';


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
   components: {
        CardComponent
    },
    methods: {

        cardCreated(card: CardUI) {

            console.log(`Starting folding animation for ${card.index}`)
            card.top = 5;
            card.left = 50 + (card.index * 50);
            card.isFacedown = false;

            // After only the briefest of pauses, we're going to mark this card as "mucked", so it goes flying towards the dealer
            setTimeout(() => {

                card.top = this.dealerPosition.top;
                card.left = this.dealerPosition.left;
                card.isFacedown = true;

                // After we have given the card time to reach the dealer, then zap it
                setTimeout(() => {

                    card.top = card.left = null;

                }, 300)

            }, 10);

        }

    }

});

export default FoldingComponent;

</script>
