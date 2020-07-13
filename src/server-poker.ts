import { Deck } from "./cards/deck";
import { Hand } from "./hands/hand";
import { PokerHandEvaluator } from "./games/poker/poker-hand-evaluator";
import { PokerHandDescriber} from "./games/poker/poker-hand-describer";
import { Player } from "./players/player";
import { Card } from "./cards/card";
import { CardValue } from "./cards/card-value";
import { CardSuit } from "./cards/card-suit";
import { Table } from "./casino/table";
import { PokerGameFiveCardDraw } from "./games/poker/five-card-draw/poker-game-five-card-draw";


let table = new Table(6, new Deck());
table.setGame(new PokerGameFiveCardDraw());

table.seatPlayer(new Player('Danny'));
table.seatPlayer(new Player('Paul'));
table.seatPlayer(new Player('Joe'));
table.seatPlayer(new Player('Mark'));

table.playHand();

