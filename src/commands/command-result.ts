﻿export class CommandResult {

    public isSuccess: boolean;
    public message: string;


    constructor(isSuccess: boolean, message: string) {

        this.isSuccess = isSuccess;
        this.message = message;

    }

}