<template>

    <div class="page-casino">

        <banner-component></banner-component>

        <router-view></router-view>
    </div>

</template>

<script lang="ts">
    import { defineComponent, computed, watch, onUnmounted } from "vue";

    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';

    import BannerComponent from './components/banner/BannerComponent.vue';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';
    import { ClientAuthenticationManager } from '@/app/communication/client-side/client-authentication-manager';
    import { userState } from '@/store/user-state';
    import { casinoClient } from './casino-client';
    import router from '@/router';

    export default defineComponent({
        name: "Casino",
        components: {
            BannerComponent,
        },
        setup() {

            if (!userState.getGameClient.value) {

                userState.setConnected(false);

                const ws = new WebSocket('ws://localhost:3000');

                const gameClient = new GameClient(new BrowserWebSocketWrapper(ws), new ClientAuthenticationManager());

                // Now join all the links in the chain
                casinoClient.registerCommandHandler(gameClient);
                gameClient.registerMessageHandler(casinoClient);

                userState.setGameClient(gameClient);

                ws.addEventListener('open', () => {

                    userState.setConnected(true);

                    // Only try to authenticate if we have a token
                    if (userState.getToken.value != null) {

                        console.log('Connection opened, trying authentication');
                        gameClient.authenticate();

                    }

                });

            }
            else {

                console.log('GameClient already exists, so leaving it alone');

            }

            watch(() => userState.getToken.value,

                (newValue) => {

                    if (!newValue) {

                        router.push({ name: 'Login' });

                    }

                });

            onUnmounted(() => {


            });


            // const showLogin = computed((): boolean => isAuthenticated.value === false && router.currentRoute.value.name == 'Login');

            userState.setChipFormatter(new MoneyFormatter());

            return {
              //  showLogin
            };
        },
    });
</script>
<style scoped lang="scss">
    .page-casino
    {
        display: flex;
        flex-direction: column;
    }
</style>
