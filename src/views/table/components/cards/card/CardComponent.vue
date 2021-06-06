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

    import { defineComponent, computed, reactive, onMounted } from 'vue';

    import { Card } from '@/app/cards/card';
    import { FacedownCard } from '@/app/cards/face-down-card';

    import { CardUI } from '../card-ui';
    import { tableState } from '@/store/table-state';

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
            }

        },
        setup(props, context) {

            const cardUI = reactive(new CardUI(props.index, props.card.isDealing));

            const isVisible = computed((): boolean => cardUI.top != null);
            const isFaceUp = computed((): boolean => props.card instanceof Card);

            const isUsed = computed((): boolean => tableState.isCardUsed(props.card));

            const top = computed((): number => {
                return cardUI.top - (tableState.getShowdownRequired.value && (isUsed.value ? 10 : 0));

            });

            const left = computed((): number => cardUI.left);

            const cardClasses = computed(() => {

                let classes: string[] = ['card', 'card-small-2'];

                if (props.card instanceof Card) {

                    classes.push(props.card.suit.text);

                    if (cardUI.isFacedown) {
                        classes.push('face-down');
                    }

                }
                else {
                    classes.push('face-down');
                }

                if (props.isGhost) {
                    classes.push('ghost');
                }

                if (props.isFolding) {
                    classes.push('folding');
                }

                if (tableState.getShowdownRequired.value) {

                    classes.push('showdown');

                    if (isUsed.value) {

                        classes.push('used');

                    }

                }

                return classes;

            });

            onMounted(() => {

                context.emit('card-created', cardUI);

            });

            return {

                isVisible,
                isFaceUp,
                top,
                left,
                cardClasses

            };

        }

    });

    
export default CardComponent;

</script>
