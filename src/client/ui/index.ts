import './style.scss';

import Vue from 'vue';

var app = new Vue({
    el: '#poker',
    data: {
        name: 'Daniel',
        message: 'Here we go again',
        players:
            [
                { name: 'Daniel', chips: 500, playing: false },
                { name: 'Mark', chips: 200, playing: false }
            ]


    }
});

console.log('Here I am');