import './style.scss';
import { Player } from '../../players/player';

import Vue from 'vue';

let playerID: number = 0;

let players: Player[] = new Array<Player>();

players.push(createPlayer('Danny', 1000));
players.push(createPlayer('Mark', 400));
players.push(createPlayer('Paul', 600));
players.push(createPlayer('Joe', 800));
players.push(createPlayer('Sekhar', 0));

var app = new Vue({
    el: '#poker',
    data: {
        name: 'Daniel',
        message: 'Here we go again',
        players: players

    }
});

console.log('Here I am');


const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (evt: MessageEvent) => {
    const data: any = JSON.parse(evt.data);
    console.log(data);
};


function createPlayer(name: string, numChips: number): Player {

    let player: Player = new Player(++playerID, name);
    player.chips = numChips;

    return player;

}
