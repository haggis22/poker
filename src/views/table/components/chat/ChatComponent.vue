<template>

    <div class="chat">

        <input type="text" 
               class="chat-text"
               v-model="message" 
               @change.stop="sendMessage"
               placeholder="Type chat messages here" />

    </div>

</template>


<script lang="ts">


import './chat.scss';

import Vue from 'vue';

    import { TableUI } from '../../table-ui';
    import { ChatCommand } from '../../../../commands/table/chat/chat-command';

const ChatComponent = Vue.extend ({

    props: {
        ui: {
            type: TableUI,
            required: true
        }
    },
    data() {

        let values =
        {
            message: null
        };

        return values;

    },
    methods: {


        sendMessage() {

            if (this.message && this.message.length) {

                this.ui.sendCommand(new ChatCommand(this.ui.table.id, this.message));
                this.message = '';

            }

        }
    }

});

export default ChatComponent;

</script>
