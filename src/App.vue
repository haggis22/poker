<template>
    <div id="app">

        <router-view :key="$route.fullPath" />

    </div>
</template>

<style lang="scss">

    body {
        -webkit-user-select: none;
        -moz-user-select: -moz-none;
        -ms-user-select: none;
        user-select: none;
    }

</style>
