<template>

    <div>
        <lobby-component v-if="client" 
                            :client="client"></lobby-component>
    </div>

</template>

<script lang="ts">

    import Vue from 'vue';

    import { LobbyClient } from './lobby-client';
    import { MoneyFormatter } from '../../casino/tables/chips/money-formatter';
    import { GameClient } from '../../communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../communication/client-side/browser-web-socket-wrapper';

    import LobbyComponent from './components/lobby/LobbyComponent.vue';


    export default {
        name: "Lobby",
        components: {
            'lobby-component': LobbyComponent
        },
        data() {

            let values = {
                client: null
            };

            return values;

        },
        created() {

            const ws = new WebSocket('ws://localhost:3000');

            ws.addEventListener('open', () => { 

                console.log('Connection opened');

                let client: LobbyClient = new LobbyClient(new MoneyFormatter());
                let gameClient: GameClient = new GameClient(new BrowserWebSocketWrapper(ws), 'dshell');

                // Now join all the links in the chain
                client.registerCommandHandler(gameClient);
                gameClient.registerMessageHandler(client);

                this.client = client;

                client.authenticate();

            });

        }

    };

</script>
