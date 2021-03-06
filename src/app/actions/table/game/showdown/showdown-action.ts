import { TableAction } from "../../table-action";

export class ShowdownAction extends TableAction {

    public isShowdownRequired: boolean;

    constructor(tableID: number, isShowdownRequired: boolean) {

        super(tableID);

        this.isShowdownRequired = isShowdownRequired;

    }

}