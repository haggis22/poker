<template>

    <div v-if="messages.length" class="message-popup">


        <h2>Error!</h2>

        <ul>
            <li v-for="(message, index) in messages"
                :key="`message-${message}`">{{ message }}</li>
        </ul>

        <div class="buttons">
            <button type="button"
                    @click.stop="clearMessages">OK</button>
        </div>
    </div>

</template>


<script lang="ts">

    import { defineComponent, computed } from "vue";

    import { messageState } from '@/store/message-state';

    const MessagePopupComponent = defineComponent ({

        setup() {

            const messages = computed((): string[] => messageState.getMessages.value);

            const clearMessages = (): void => {

                messageState.clearMessages();

            };

            return {

                messages,
                clearMessages,

            };

        }

    });

    export default MessagePopupComponent;

</script>

<style scoped lang="scss">

    .message-popup {
        z-index: 25;
        width: 500px;
        background-color: lightcoral;
        border: 4px solid red;
        padding: 0 20px 20px 20px;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .buttons
        {
            text-align: center;
        }

    }

</style>