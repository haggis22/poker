<template>

    <div>
        <lobby-component v-if="client" 
                            :client="client"></lobby-component>
    </div>

</template>

<script lang="ts">

    import { defineComponent, ref } from "vue";

    import { LobbyClient } from './lobby-client';
    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';

    import LobbyComponent from './components/lobby/LobbyComponent.vue';
import { lobbyState } from '@/store/lobby-state';


    export default defineComponent({

        name: "Lobby",

        components: {
            LobbyComponent
        },

        setup() {

            const client = ref(null as LobbyClient);

            lobbyState.setChipFormatter(new MoneyFormatter());

            const ws = new WebSocket('ws://localhost:3000');

            ws.addEventListener('open', () => {

                console.log('Connection opened');

                const lobbyClient: LobbyClient = new LobbyClient();
                const gameClient: GameClient = new GameClient(new BrowserWebSocketWrapper(ws), 'dshell');

                // Now join all the links in the chain
                lobbyClient.registerCommandHandler(gameClient);
                gameClient.registerMessageHandler(lobbyClient);

                client.value = lobbyClient;

                lobbyClient.authenticate();

            });

            return {

                client

            };

        },

    });

</script>
