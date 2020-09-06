import { Game } from "../../games/game";
import { Stakes } from "../../casino/tables/betting/stakes";
import { TableRules } from "../../casino/tables/table-rules";
import { Command } from "../command";

export class CreateTableCommand extends Command {

    public game: Game;
    public rules: TableRules;
    public stakes: Stakes;

    constructor(rules: TableRules, game: Game, stakes: Stakes) {

        super();

        this.rules = rules;
        this.game = game;
        this.stakes = stakes;

    }

}