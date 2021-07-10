<template>

    <tr>
        <td class="id">{{ tournament.id }}</td>
        <td class="name">{{ tournament.name }}</td>
        <td class="registrants">{{ numRegistrants }}</td>
        <td class="buy-in">
            {{ chipFormatter.format(tournament.buyIn) }}
        </td>
        <td class="register">
            <span v-if="isRegistered">Registered</span>
            <span v-else>
                <button class="register" 
                        :disabled="isRegistered"
                        :title="registrationTitle"
                        @click.stop="register()"
                        >Register</button>
            </span>
           
        </td>
    </tr>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { TournamentSummary } from '@/app/casino/tournaments/tournament-summary';
    import { userState } from "@/store/user-state";
    import { lobbyClient } from '../../lobby-client';


    const TournamentComponent = defineComponent({

        props: {

            tournament: {
                type: TournamentSummary,
                required: true
            },


        },
        setup(props) {

            const chipFormatter = computed(() => userState.getChipFormatter.value);

            const tournament = computed(() => props.tournament);

            const numRegistrants = computed(() => tournament.value.registrants.length.toLocaleString());

            const userID = computed(() => userState.getUserID.value);
            const balance = computed((): number => userState.getBalance.value);

            const isRegistered = computed(() => userID != null && tournament.value.registrants.find(registrant => registrant === userID.value));

            const hasEnoughMoney = computed(() => balance.value != null && tournament.value.buyIn <= balance.value);

            const registrationTitle = computed(() => {

                if (isRegistered.value) {

                    return 'You are registered for this tournament';

                }

                else if (!tournament.value.isRegistrationOpen)
                {
                    return 'Registration is closed';
                }

                else if (!hasEnoughMoney) {

                    return 'You do not have enough money to buy in to this tournament';

                }

                return 'Register and play!';

            });

            const register = (): void => {

                lobbyClient.registerForTournament(tournament.value.id);

            };


            return {

                chipFormatter,

                tournament,
                numRegistrants,

                isRegistered,
                hasEnoughMoney,
                registrationTitle,

                userID,

                register

            };

        },
        components: {
        }

    });

    export default TournamentComponent;

</script>

<style scoped lang="scss">


</style>
