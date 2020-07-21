import { Deck } from "./cards/deck";
import { Player } from "./players/player";
import { Table } from "./casino/tables/table";
import { PokerGameFiveCardDraw } from "./games/poker/five-card-draw/poker-game-five-card-draw";
import { PokerGameFiveCardStud } from "./games/poker/five-card-stud/poker-game-five-card-stud";
import { MoneyFormatter } from "./casino/chips/money-formatter";


let table = new Table(6, new Deck());
// table.setGame(new PokerGameFiveCardStud());
table.setGame(new PokerGameFiveCardDraw());
table.chipFormatter = new MoneyFormatter();

table.seatPlayer(new Player('Danny'), 1000);
table.seatPlayer(new Player('Paul'), 1000);
table.seatPlayer(new Player('Joe'), 1000);
table.seatPlayer(new Player('Mark'), 1000);

table.playHand();

