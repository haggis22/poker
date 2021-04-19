import { FakeSocket } from './fake-socket';
import { ISocketWrapper } from '../i-socket-wrapper';
import { Serializer } from '../serializer';


export class FakeSocketWrapper implements ISocketWrapper {

    private socket: FakeSocket;
    private serializer: Serializer

    
    constructor(socket: FakeSocket) {

        this.socket = socket;
        this.serializer = new Serializer();

    }


    public addEventListener(method: 'message' | 'close', callback: (obj: any) => void) {

        if (method === 'message') {

            this.socket.addEventListener(method, (msg: string) => {

                let o: any = this.serializer.deserialize(msg);

                if (o) {
                    callback(o);
                }

            });

        }

    }

    public send(o: any): void {

        if (this.socket) {

            this.socket.send(this.serializer.serialize(o));

        }

    }



}