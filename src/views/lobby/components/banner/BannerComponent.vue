<template>

    <div>

            <div class="panel-banner">

                <div class="dashboard">

                    <div v-if="user">

                        <div class="welcome">Welcome, {{ user.name }}</div>
                        <div class="balance">Balance: {{ chipFormatter.format(balance) }}</div>
                    </div>
                    <div v-else>
                        <div class="panel-club">Corn Dog Poker Club</div>
                    </div>

                </div>

                <div class="panel-log-out">
                    <button class="log-out" @click.stop="logOut()">Log Out</button>
                </div>

            </div>

    </div>

</template>

<script lang="ts">

    import { defineComponent, computed } from 'vue';

    import { UserSummary } from '@/app/players/user-summary';

    import { lobbyState } from "@/store/lobby-state";
    import { userState } from "@/store/user-state";
    import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';



    const LobbyComponent = defineComponent({

        setup() {

            const user = computed((): UserSummary => userState.getUser.value);

            const chipFormatter = computed((): IChipFormatter => lobbyState.getChipFormatter.value);
            const balance = computed((): number => userState.getBalance.value);

            const logOut = (): void => {

                userState.logOut();

            };


            return {

                user,

                chipFormatter,
                balance,

                logOut

            };

        },
        components: {
        }

    });

    export default LobbyComponent;

</script>

<style scoped lang="scss">

    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;700&display=swap');

    $font: "Times New Roman", serif;

    .panel-banner {
        height: 80px;
        background-color: #08f;
        color: white;
        padding: 0;
        box-sizing: border-box;
        border-top: 2px black solid;
        border-left: 2px black solid;
        border-right: 2px black solid;

        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;

        .dashboard {

                       width: 500px;
                       padding: 10px;

            display: inline-block;
            flex: 1 0 auto;

            .welcome
            {
                font-size: 1.5em;
            }

            .balance {
                font-size: 1.25em;
                margin-top: 8px;
            }

            .panel-club {

                text-transform: uppercase;
                font-size: 2em;

            }

        }

    .panel-log-out {

        display: flex;
        flex-flow: column;
        justify-content: center;
        padding: 10px;
        width: 150px;
        flex: 0 0 auto;
        text-align: center;

        button.log-out
        {
            height: 50%;
            width: 80px;
            margin: auto;
            vertical-align: middle;
        }
    }


    }

</style>
