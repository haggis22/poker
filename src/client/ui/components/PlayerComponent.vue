<template>
    <h3>Mijn naam is {{ name }}, bucko</h3>
</template>

<script>

import Vue from 'vue';

export default Vue.component({

    props: {
        name: {
            type: String,
            required: true
        }
    }
});


</script>
