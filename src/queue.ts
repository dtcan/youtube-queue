interface QueueSubscriber {
    onAdd: (who: string, id: string, index: number) => void,
    onRemove: (who: string, id: string, index: number) => void
}

class Queue {
    subscribers: Map<string, QueueSubscriber> = new Map<string, QueueSubscriber>();
    list: string[] = []

    addSubscriber(id: string, subscriber: QueueSubscriber) {
        this.subscribers.set(id, subscriber);
    }

    removeSubscriber(id: string) {
        this.subscribers.delete(id);
    }

    addVideo(who: string, id: string, index: number = -1) {
        if (0 <= index && index < this.list.length) {
            this.list.splice(index, 0, id);
            this.broadcast(s => s.onAdd(who, id, index));
        } else {
            this.list.push(id);
            this.broadcast(s => s.onAdd(who, id, this.list.length - 1));
        }
    }

    removeVideo(who: string, index: number): string | undefined {
        if (0 <= index && index < this.list.length) {
            let removed = this.list.splice(index, 1)[0];
            this.broadcast(s => s.onRemove(who, removed, index));
            return removed;
        }
        return undefined;
    }

    private broadcast(emitter: (subscriber: QueueSubscriber) => void) {
        for (let [_, subscriber] of this.subscribers.entries()) {
            emitter(subscriber);
        }
    }
}

const QUEUE_SINGLETON = new Queue();
export default QUEUE_SINGLETON;
