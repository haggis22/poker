import WebSocket from 'ws';

import { ISocketWrapper } from '../i-socket-wrapper';
import { Serializer } from '../serializer';


export class ServerWebSocketWrapper implements ISocketWrapper {

    private socket: WebSocket;
    private serializer: Serializer

    constructor(socket: WebSocket) {

        this.socket = socket;
        this.serializer = new Serializer();

    }

    public addEventListener(method: 'message' | 'close', callback: (obj: any) => void) {

        if (method === 'message') {

            this.socket.addEventListener(method, (event: any) => {

                if (typeof event.data === 'string') {

                    let o: any = this.serializer.deserialize(event.data);
                    if (o) {
                        callback(o);
                    }
                }

            });

        }
        else if (method === 'close') {

            this.socket.addEventListener(method, (event: any) => {

                callback(event);

            });

        }

    }


    public send(o: any): void {

        if (this.socket) {

            this.socket.send(this.serializer.serialize(o));

        }

    }



}