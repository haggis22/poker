<template>

    <div class="page-lobby">

        <lobby-component v-if="isAuthenticated"></lobby-component>

    </div>

</template>

<script lang="ts">

    import { defineComponent, computed } from "vue";

    import { lobbyClient } from './lobby-client';
    import { GameClient } from '../../app/communication/client-side/game-client';

    import LobbyComponent from './components/lobby/LobbyComponent.vue';
    import { lobbyState } from '@/store/lobby-state';
    import { userState } from '@/store/user-state';
import { SubscribeLobbyCommand } from '@/app/communication/serializable';


    export default defineComponent({

        name: "Lobby",

        components: {
            LobbyComponent
        },

        setup() {

            const gameClient = computed((): GameClient => userState.getGameClient.value);

            const isAuthenticated = computed((): boolean => userState.isAuthenticated.value);

            // Now join all the links in the chain
            lobbyClient.registerCommandHandler(gameClient.value);
            gameClient.value.registerMessageHandler(lobbyClient);

            // let me know when the tables update
            lobbyClient.broadcastCommand(new SubscribeLobbyCommand());


            return {

                isAuthenticated

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
