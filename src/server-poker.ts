import { Deck } from "./cards/deck";
import { Hand } from "./cards/hand";
import { HandEvaluator as PokerHandEvaluator } from "./games/poker/hand-evaluator";
import { HandDescriber as PokerHandDescriber} from "./games/poker/hand-describer";
import { Player } from "./players/player";

let deck = new Deck();


let players = new Array<Player>();

players.push(new Player('Daniel'));
players.push(new Player('Paul'));
players.push(new Player('Joe'));
players.push(new Player('Mark'));

for (let c = 0; c < 5; c++) {

    for (let p = 0; p < players.length; p++) {

        players[p].hand.deal(deck.deal());

    }

}

const evaluator = new PokerHandEvaluator();
const describer = new PokerHandDescriber();

for (let p = 0; p < players.length; p++) {

    let hand = players[p].hand;

    let evaluation = evaluator.evaluate(hand);

    console.log(`${players[p].name}, ${hand.display()}:  ${describer.describe(evaluation)}`);

}
