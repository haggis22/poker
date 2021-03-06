export class FakeSocket {

    private otherParty: FakeSocket;
    private messageListeners: Array<(msg: string) => void>;

    constructor() {

        this.messageListeners = new Array<(msg: string) => void>();

    }

    public connect(otherParty: FakeSocket) {

        this.otherParty = otherParty;

    }

    public send(message: string): void {

        if (this.otherParty) {

            // introduce a slight delay so that all the robotic activity isn't just direct method invocations
            setTimeout(() => { this.otherParty.receive(message); }, 0);
        }

    }

    public addEventListener(method: 'message', cb: (msg: string) => void) {

        this.messageListeners.push(cb);

    }

    private receive(msg: string): void {

        for (let listener of this.messageListeners) {
            listener(msg);
        }

    }  // receive

}