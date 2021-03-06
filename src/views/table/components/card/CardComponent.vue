<template>
    <div v-if="isVisible" :class="cardClasses" :style="{ 'top': `${top}px`, 'left': `${left}px` }">
        <div class="card-inner">
            <div class="card-front">
                <div v-if="isFaceUp" class="symbols left">
                    <div class="value">{{ card.value.symbol }}</div>
                    <div class="suit">{{ card.suit.symbol }}</div>
                </div>
                <div v-if="isFaceUp" class="symbols right">
                    <div class="value">{{ card.value.symbol }}</div>
                    <div class="suit">{{ card.suit.symbol }}</div>
                </div>
            </div>
            <div class="card-back">
                &nbsp;
            </div>
        </div>
    </div>
</template>


<script lang="ts">

import './card.scss';

    import { defineComponent } from 'vue';

    import { Card } from '@/app/cards/card';
    import { FacedownCard } from '@/app/cards/face-down-card';

    import { CardUI } from '../../card-ui';

    const CardComponent = defineComponent({

        props: {
            card: {
                type: [Card, FacedownCard],
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            isFolding: {
                type: Boolean,
                required: false
            },
            isGhost: {
                type: Boolean,
                required: false
            },
            isShowdown: {
                type: Boolean,
                required: false
            },
            isUsed: {
                type: Boolean,
                required: false
            }
        },

    data() {

        let values =
        {
            cardUI: new CardUI(this.index)
        };

        return values;

    },
    mounted() {

        this.$emit('card-created', this.cardUI);

    },
    computed: {

        isVisible: function (): boolean {

            return this.cardUI.top != null;

        },
        isFaceUp: function (): boolean {

            return this.card instanceof Card;

        },
        top: function (): number {

            return this.cardUI.top - (this.isShowdown && this.isUsed ? 10 : 0);

        },
        left: function (): number {

            return this.cardUI.left;

        },
        cardClasses: function () {

            let classes: string[] = [ 'card', 'card-small-2' ];

            if (this.card instanceof Card) {

                classes.push(this.card.suit.text);

                if (this.cardUI.isFacedown) {
                    classes.push('face-down');
                }

            }
            else {
                classes.push('face-down');
            }

            if (this.isGhost) {
                classes.push('ghost');
            }

            if (this.isFolding) {
                classes.push('folding');
            }

            if (this.isShowdown) {

                classes.push('showdown');

                if (this.isUsed) {

                    classes.push('used');

                }

            }

            return classes;

        }

    },
    methods: {

    }

});

    
export default CardComponent;

</script>
