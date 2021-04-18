import { CommandHandler } from "../../commands/command-handler";
import { Command } from "../../commands/command";
import { MessageBroadcaster } from "../../messages/message-broadcaster";
import { MessageHandler } from "../../messages/message-handler";
import { Message } from "../../messages/message";
import { ActionMessage } from "../../messages/action-message";
import { ISocketWrapper } from "../i-socket-wrapper";

import { AuthenticationManager } from "../authentication-manager";
import { AuthenticateCommand } from '../../commands/security/authenticate-command';

import { v4 as uuidv4 } from 'uuid';


export class GameClient implements MessageBroadcaster, CommandHandler {

    public id: string;

    public socket: ISocketWrapper;
    public tokenManager: AuthenticationManager;

    // A map of MessageHandlers
    // Key = MessageHandler.id, so that the same handler will not be added more than once
    // Value = MessageHandler object
    public messageHandlers: Map<string, MessageHandler>;


    constructor(socket: ISocketWrapper, tokenManager: AuthenticationManager) {

        this.id = uuidv4();

        this.socket = socket;
        this.socket.addEventListener('message', (obj: any) => { this.receive(obj); });

        this.tokenManager = tokenManager;

        this.messageHandlers = new Map<string, MessageHandler>();

    }


    receive(msgObj: any): void {

        // this.log(`received ${msgObj.constructor.name}: ${msg}`);

        if (msgObj instanceof Message) {

            // this.log('Yes, it is a Message');

/*
            if (msgObj instanceof ActionMessage) {

                const action: Action = msgObj.action;

                if (action instanceof AuthenticatedAction) {

                    this.authenticatedAction(action);

                }

                else if (action instanceof AuthenticationFailedAction) {

                    this.authenticationFailedAction(action);

                }

                else if (action instanceof LoginFailedAction) {

                    this.loginFailedAction(action);

                }

                else if (action instanceof LogoutAction) {

                    this.logoutAction(action);

                }

            }
*/

            // Pass the message along
            for (let handler of this.messageHandlers.values()) {

                // this.log(`Passed message to ${handler.constructor.name}`);
                handler.handleMessage(msgObj);

            }

        }

        else {

            this.log('No, it is NOT a Message');

        }
   

    }


    registerMessageHandler(handler: MessageHandler) {

        this.messageHandlers.set(handler.id, handler);

    }

    unregisterMessageHandler(handler: MessageHandler) {

        this.messageHandlers.delete(handler.id);

    }


    handleCommand(command: Command): void {

        this.log(`Sending ${command.constructor.name}`);

        // Stamp every outgoing message with the saved authorization token
        command.authToken = this.tokenManager.getToken();

        this.socket.send(command);

    }  // handleCommand


    public log(msg: string): void {

        console.log('\x1b[36m%s\x1b[0m', `GameClient ${msg}`);

    }

    public authenticate(): void {

        this.handleCommand(new AuthenticateCommand());

    }   // authenticate


}