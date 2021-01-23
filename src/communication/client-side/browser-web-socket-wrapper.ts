import { ISocketWrapper } from '../i-socket-wrapper';
import { Serializer } from '../serializer';
import { IBrowserWebSocket } from './i-browser-web-socket';


export class BrowserWebSocketWrapper implements ISocketWrapper {

    private socket: IBrowserWebSocket;
    private serializer: Serializer

    constructor(socket: IBrowserWebSocket) {

        this.socket = socket;
        this.serializer = new Serializer();

    }

    public addEventListener(method: 'message', callback: (obj: any) => void) {

        this.socket.onmessage = (event: MessageEvent) => { 

            if (typeof event.data === 'string') {

                let o: any = this.serializer.deserialize(event.data);
                if (o) {
                    callback(o);
                }
            }

        };

    }

    public send(o: any): void {

        if (this.socket) {

            this.socket.send(this.serializer.serialize(o));

        }

    }



}