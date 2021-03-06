<template>
    <div :class="getClasses">
        {{ handDescription }}
    </div>
</template>


<script lang="ts">


import './winning-hand.scss';

import Vue from 'vue';

const WinningHandComponent = Vue.extend ({

    props: {
        handDescription: {
            type: String,
            required: true
        }

    },
    data() {

        let values = {

            isAnnounced: false

        };

        return values;

    },
    created() {

        // After only the briefest of pauses, we're going to have this bubble appear
        this.timer = setTimeout(() => {

            this.isAnnounced = true;

        }, 10);

    },
    computed: {

        getClasses: function () {

            let classes: string[] = ['winning-hand'];

            if (this.isAnnounced) {
                classes.push('announced');
            }

            return classes;
        }

    },
    methods: {


    }

});

export default WinningHandComponent;

</script>
