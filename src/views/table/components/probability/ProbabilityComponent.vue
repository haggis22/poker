<template>
    <div :class="classes">
        <div class="chance">{{ formatPercent(chance) }}</div>
    </div>
</template>


<script lang="ts">

    import { defineComponent, computed } from 'vue';

    const ProbabilityComponent = defineComponent ({

        props: {
            chance: {
                type: Number,
                required: true
            }
        },
        setup(props) {

            const chance = props.chance;

            let classes = computed((): string[] => {

                const classes = ['probability-display'];

                return classes;

            });

            const formatPercent = (chance: number): string => { return `${(chance * 100).toFixed(0)}%`; }

            return {

                chance,
                classes,

                formatPercent

            }


        },

        unmounted() {

        }

    });

    export default ProbabilityComponent;

</script>

<style lang="scss">

    .probability-display {
        margin-left: auto;
        margin-right: auto;
        display: inline-block;
        padding: 0;
        background: aliceblue;
        color: black;
        font-size: 24px;
        width: 150px;
        height: 30px;
        box-sizing: border-box;
        border: 2px solid black;

    }


</style>