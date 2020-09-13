<template>
    <h3>Mijn naam is {{ name }}, bucko</h3>
</template>

<script lang="ts">

import Vue from 'vue';

const PlayerComponent = Vue.extend ({

    props: {
        name: {
            type: String,
            required: true
        }
    }

});

export default PlayerComponent;

</script>
