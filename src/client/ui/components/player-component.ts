import Vue from 'vue';



import { Player } from '../../../players/player';


Vue.component('player-comp', {


    data: function () {

        return {
            name: 'Daniel'
        }
    },
    template: '<h3>My name is {{ name }}</h3>'

})