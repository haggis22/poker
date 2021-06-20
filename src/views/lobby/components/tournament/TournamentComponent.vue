<template>

    <tr>
        <td>{{ tournament.id }}</td>
        <td class="name">{{ tournament.name }}</td>
    </tr>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { TournamentSummary } from '@/app/casino/tournaments/tournament-summary';


    const TournamentComponent = defineComponent({

        props: {

            tournament: {
                type: TournamentSummary,
                required: true
            },



        },
        setup(props) {


            return {

            };

        },
        components: {
        }

    });

    export default TournamentComponent;

</script>

<style scoped lang="scss">

    .name,
    .description,
    .players
    {
        text-align: left;
    }

    .seats
    {
        text-align: center;
    }

</style>
