<template>

    <tr>
        <td class="id">{{ tournament.id }}</td>
        <td class="name">{{ tournament.name }}</td>
        <td class="buy-in">{{ chipFormatter.format(tournament.buyIn) }}</td>
    </tr>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { TournamentSummary } from '@/app/casino/tournaments/tournament-summary';
    import { userState } from "@/store/user-state";
import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';


    const TournamentComponent = defineComponent({

        props: {

            tournament: {
                type: TournamentSummary,
                required: true
            },


        },
        setup(props) {

            const chipFormatter = computed(() => userState.getChipFormatter.value);


            return {

                chipFormatter

            };

        },
        components: {
        }

    });

    export default TournamentComponent;

</script>

<style scoped lang="scss">


</style>
