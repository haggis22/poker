<template>

    <div class="panel-login">

        <table class="login-table">
            <tbody>
                <tr>
                    <td>Username:</td>
                    <td><input type="text" 
                               v-model="username" /></td>
                </tr>
                <tr>
                    <td>Password:</td>
                    <td><input type="password"
                               v-model="password" /></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" class="buttons">
                        <button type="button" @click.stop="logIn()">Log In</button>
                    </td>
                </tr>
            </tfoot>
       </table>

        <div v-if="loginErrorMessage" class="login-error-message">
            {{ loginErrorMessage }}
        </div>

    </div>

</template>

<script lang="ts">

    import { defineComponent, computed, ref } from 'vue';

    import { casinoClient } from '../casino/casino-client';
    import { userState } from '@/store/user-state';

    export default defineComponent({

        name: "Login",
        components: {
        },
        setup() {
            const username = ref(null as string);
            const password = ref(null as string);

            const loginErrorMessage = computed(() => userState.getLoginErrorMessage.value);

            const logIn = (): void => {

                casinoClient.logIn(username.value, password.value);

            };

            return {

                username,
                password,

                loginErrorMessage,

                logIn

            };

        },
    });

</script>

<style scoped lang="scss">

    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;700&display=swap');

    $font: "Times New Roman", serif;

    .panel-login
    {

        padding: 20px;

        .login-table {

            border: 2px solid black;

            .buttons
            {
                text-align: center;
            }

        }

        .login-error-message {

            margin-top: 15px;
            font-weight: bold;
            color: red;

        }

    }

</style>
