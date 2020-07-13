import { Deck } from "./cards/deck";
import { Hand } from "./cards/hand";
import { HandEvaluator as PokerHandEvaluator } from "./games/poker/hand-evaluator";
import { HandDescriber as PokerHandDescriber} from "./games/poker/hand-describer";
import { Player } from "./players/player";
import { Card } from "./cards/card";
import { CardValue } from "./cards/card-value";
import { CardSuit } from "./cards/card-suit";

let deck = new Deck();


let players = new Array<Player>();

players.push(new Player('Danny'));
players.push(new Player('Paul'));
players.push(new Player('Joe'));
players.push(new Player('Mark'));

for (let c = 0; c < 5; c++) {

    for (let p = 0; p < players.length; p++) {

        players[p].hand.deal(deck.deal());

    }

}

let johnna = new Player('Johnna');
johnna.hand.deal(new Card(CardValue.lookup(5), CardSuit.lookup(1)));
johnna.hand.deal(new Card(CardValue.lookup(6), CardSuit.lookup(2)));
johnna.hand.deal(new Card(CardValue.lookup(7), CardSuit.lookup(3)));
johnna.hand.deal(new Card(CardValue.lookup(8), CardSuit.lookup(4)));
johnna.hand.deal(new Card(CardValue.lookup(9), CardSuit.lookup(1)));
players.push(johnna);

let zack = new Player('Zack');
zack.hand.deal(new Card(CardValue.lookup(5), CardSuit.lookup(1)));
zack.hand.deal(new Card(CardValue.lookup(6), CardSuit.lookup(1)));
zack.hand.deal(new Card(CardValue.lookup(7), CardSuit.lookup(1)));
zack.hand.deal(new Card(CardValue.lookup(8), CardSuit.lookup(1)));
zack.hand.deal(new Card(CardValue.lookup(9), CardSuit.lookup(1)));
players.push(zack);

let violet = new Player('Violet');
violet.hand.deal(new Card(CardValue.lookup(14), CardSuit.lookup(1)));
violet.hand.deal(new Card(CardValue.lookup(2), CardSuit.lookup(2)));
violet.hand.deal(new Card(CardValue.lookup(4), CardSuit.lookup(1)));
violet.hand.deal(new Card(CardValue.lookup(5), CardSuit.lookup(4)));
violet.hand.deal(new Card(CardValue.lookup(3), CardSuit.lookup(1)));
players.push(violet);

let stanLee = new Player('StanLee');
stanLee.hand.deal(new Card(CardValue.lookup(14), CardSuit.lookup(3)));
stanLee.hand.deal(new Card(CardValue.lookup(2), CardSuit.lookup(3)));
stanLee.hand.deal(new Card(CardValue.lookup(4), CardSuit.lookup(3)));
stanLee.hand.deal(new Card(CardValue.lookup(5), CardSuit.lookup(3)));
stanLee.hand.deal(new Card(CardValue.lookup(3), CardSuit.lookup(3)));
players.push(stanLee);

const evaluator = new PokerHandEvaluator();
const describer = new PokerHandDescriber();

for (let p = 0; p < players.length; p++) {

    let hand = players[p].hand;

    let evaluation = evaluator.evaluate(hand);

    console.log(`${players[p].name}, ${hand.display()}:  ${describer.describe(evaluation)}`);

}
