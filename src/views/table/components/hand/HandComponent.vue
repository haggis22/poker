<template>
    <div class="hand">
        <card-component v-for="(card, index) in this.cards"
                        :key="`hand-card-${index}`"
                        :card="card"
                        :index="index"
                        :is-showdown="ui.isShowdownRequired"
                        @card-created="cardCreated"></card-component>
    </div>
</template>


<script lang="ts">


import './hand.scss';

    import { defineComponent } from 'vue';

    import { UIPosition } from '@/app/ui/ui-position';

    import CardComponent from '../card/CardComponent.vue';
    import { CardUI } from '../../card-ui';
    import { TableUI } from '../../table-ui';



const HandComponent = defineComponent ({

    props: {
        cards: {
            type: Array,
            required: true
        },
        dealerPosition: {
            type: UIPosition,
            required: true
        },
        ui: {
            type: TableUI,
            required: true
        }

    },
    data() {

        let values = {};

        return values;

    },
   components: {
        'card-component': CardComponent
    },
    computed: {


    },
    methods: {

        cardCreated(card: CardUI) {

            console.log(`Starting dealing animation for ${card.index}`)
            card.top = this.dealerPosition.top;
            card.left = this.dealerPosition.left;
            card.isFacedown = true;

            // After only the briefest of pauses, we're going to mark this card as "dealt", so it comes flying in
            setTimeout(() => {

                card.top = 5;
                card.left = 50 + (card.index * 50);
                card.isFacedown = false;

            }, 10);

        }

    }

});

export default HandComponent;

</script>
