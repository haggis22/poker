import { Deck } from "./cards/deck";
import { Player } from "./players/player";
import { Table } from "./casino/tables/table";
import { PokerGameFiveCardDraw } from "./games/poker/five-card-draw/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./games/poker/five-card-stud/poker-game-five-card-stud";


let table = new Table(6, new Deck());
// table.setGame(new PokerGameFiveCardStud());
table.setGame(new PokerGameFiveCardDraw());

table.seatPlayer(new Player('Danny'));
table.seatPlayer(new Player('Paul'));
table.seatPlayer(new Player('Joe'));
table.seatPlayer(new Player('Mark'));

table.playHand();

