<template>

    <div class="page-lobby">

        <lobby-component></lobby-component>

    </div>

</template>

<script lang="ts">

    import { defineComponent, computed, watch } from "vue";

    import { lobbyClient } from './lobby-client';
    import { GameClient } from '../../app/communication/client-side/game-client';

    import LobbyComponent from './components/lobby/LobbyComponent.vue';
    import { userState } from '@/store/user-state';

    import { SubscribeLobbyCommand } from '@/app/communication/serializable';


    export default defineComponent({

        name: "Lobby",

        components: {
            LobbyComponent
        },

        setup() {

            const gameClient = computed((): GameClient => userState.getGameClient.value);

            // Now join all the links in the chain
            lobbyClient.registerCommandHandler(gameClient.value);
            gameClient.value.registerMessageHandler(lobbyClient);

            const isConnected = computed((): boolean => userState.isConnected.value);

            if (isConnected.value) {

                // let me know when the tables update
                lobbyClient.broadcastCommand(new SubscribeLobbyCommand());

            }
            else {

                // otherwise, wait until the connection has happened and then pounce
                watch(() => isConnected.value,

                    (isConnected) => {

                        if (isConnected) {

                            // let me know when the tables update
                            lobbyClient.broadcastCommand(new SubscribeLobbyCommand());

                        }

                    });

            }

            return {

            };

        },

    });

</script>

<style scoped lang="scss">

    .page-lobby
    {
        display: flex;
        flex-direction: column;
    }

</style>
