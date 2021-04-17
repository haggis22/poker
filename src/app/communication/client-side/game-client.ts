import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { ActionMessage } from "../../messages/action-message";
import { ISocketWrapper } from "../i-socket-wrapper";

import { AuthenticationManager } from "../authentication-manager";
import { AuthenticateCommand } from '../../commands/security/authenticate-command';
import { Action } from '../../actions/action';
import { AuthenticatedAction } from '../../actions/security/authenticated-action';
import { LogoutAction } from '../../actions/security/logout-action';


export class GameClient implements MessageBroadcaster, CommandHandler {

    private socket: ISocketWrapper;
    private tokenManager: AuthenticationManager;

    private messageHandlers: MessageHandler[];


    constructor(socket: ISocketWrapper, tokenManager: AuthenticationManager) {

        this.socket = socket;
        this.socket.addEventListener('message', (obj: any) => { this.receive(obj); });

        this.tokenManager = tokenManager;

        this.messageHandlers = new Array<MessageHandler>();

    }


    receive(msgObj: any): void {

        // this.log(`received ${msgObj.constructor.name}: ${msg}`);

        if (msgObj instanceof Message) {

            // this.log('Yes, it is a Message');

            if (msgObj instanceof ActionMessage) {

                const action: Action = msgObj.action;

                if (action instanceof AuthenticatedAction) {

                    this.authenticatedAction(action);

                }

                if (action instanceof LogoutAction) {

                    this.logoutAction(action);

                }

            }

            // Pass the message along
            for (let handler of this.messageHandlers) {

                // this.log(`Passed message to ${handler.constructor.name}`);
                handler.handleMessage(msgObj);

            }

        }

        else {

            this.log('No, it is NOT a Message');

        }
   

    }


    registerMessageHandler(handler: MessageHandler) {

        this.messageHandlers.push(handler);

    }

    unregisterMessageHandler(handler: MessageHandler) {

        this.messageHandlers = this.messageHandlers.filter(mh => mh !== handler);

    }


    handleCommand(command: Command): void {

        this.log(`Sending ${command.constructor.name}`);

        // Stamp every outgoing message with the saved authorization token
        command.authToken = this.tokenManager.getToken();

        this.socket.send(command);

    }  // handleCommand


    private log(msg: string): void {

        console.log('\x1b[36m%s\x1b[0m', `GameClient ${msg}`);

    }

    public authenticate(): void {

        this.handleCommand(new AuthenticateCommand());

    }   // authenticate


    private authenticatedAction(action: AuthenticatedAction): void {

        this.tokenManager.saveToken(action.authToken);

    }

    private logoutAction(action: LogoutAction): void {

        this.tokenManager.clearToken();

    }

}