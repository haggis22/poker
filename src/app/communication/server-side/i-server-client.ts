import { MessageHandler } from "../../messages/message-handler";
import { CommandBroadcaster } from "../../commands/command-broadcaster";

export interface IServerClient extends MessageHandler, CommandBroadcaster {

    userID: number;

}