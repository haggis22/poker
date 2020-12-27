<template>

    <div class="action-log">

        <div v-for="(message, index) in ui.messages" 
             :key="`log-${index}`"
             class="message">{{ message }}</div>

    </div>

</template>


<script lang="ts">


import './log.scss';

import Vue from 'vue';

import { TableUI } from '../../../table-ui';

const LogComponent = Vue.extend ({

    props: {
        ui: {
            type: TableUI,
            required: true
        }
    },
    methods: {


        scrollToEnd() {

            const messages = this.$el.getElementsByClassName('message');

            if (messages.length) {

                messages[messages.length - 1].scrollIntoView();

            }


        }
    },
    updated() {

        this.scrollToEnd();

    }

});

export default LogComponent;

</script>
