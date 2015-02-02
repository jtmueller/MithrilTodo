module TodoApp {
    export interface IFireKey {
        /** Sets or returns the Firebase token for the item. */
        key: (value?: string) => string;
    }

    export class MithrilFireStore<T extends IFireKey> {
        private data: T[] = [];
        private ref: Firebase;
        private convert: (value: FirebaseDataSnapshot) => T;

        constructor(private query: FirebaseQuery, converter?: (value: FirebaseDataSnapshot) => T) {
            this.convert = converter || (x => <T>x.val());
            this.ref = query.ref();

            this.query.on('child_added', x => this.handleChildAdded(x));
            this.query.on('child_removed', x => this.handleChildRemoved(x));
            this.query.on('child_changed', x => this.handleChildChanged(x));
            this.query.on('child_moved', (s, k) => this.handleChildMoved(s, k));
        }

        private handleChildAdded(snapshot: FirebaseDataSnapshot) {
            m.startComputation();
            var item = this.convert(snapshot);
            this.data.push(item);
            m.endComputation();
        }

        private handleChildRemoved(snapshot: FirebaseDataSnapshot) {
            m.startComputation();
            var key = snapshot.key();
            _.remove(this.data, (x: T) => x.key() === key);
            m.endComputation();
        }

        private handleChildChanged(snapshot: FirebaseDataSnapshot) {
            m.startComputation();
            var newItem = this.convert(snapshot);
            var itemIndex = _.findIndex(this.data, x => x.key() === newItem.key());
            if (itemIndex !== -1) {
                this.data[itemIndex] = newItem;
            }
            m.endComputation();
        }

        private handleChildMoved(snapshot: FirebaseDataSnapshot, prevKey: string) {
            //console.log('child_moved', snapshot, prevKey);
            m.startComputation();
            var thisKey = snapshot.key();
            var removed = _.remove(this.data, x => x.key() === thisKey);
            if (removed.length === 0) return;

            if (prevKey) {
                var prevIndex = _.findIndex(this.data, x => x.key() === prevKey);
                if (prevIndex === -1)
                    this.data.push(removed[0]);
                else
                    this.data.splice(prevIndex, 0, removed[0]);
            }
            else {
                this.data.unshift(removed[0]);
            }
            m.endComputation();
        }

        get length() {
            return this.data.length;
        }

        asArray(): T[] {
            return this.data;
        }

        filter(predicate: (item: T) => boolean) {
            return _.filter(this.data, predicate);
        }

        forEach(fn: (item: T) => void) {
            return _.forEach(this.data, fn);
        }

        map<R>(fn: (item: T) => R): R[]{
            return _.map(this.data, fn);
        }

        reduce<R>(fn: (acc:R, item:T, key?:any, data?:T[]) => R, initValue?:R) {
            return _.reduce<T, R>(this.data, fn, initValue);
        }

        push(item: T, priority?: number|string) {
            var itemData = item['toJSON'] ? item['toJSON']() : item;

            var newItem = this.ref.push();
            var key = newItem.key();
            if (priority) {
                if (typeof priority === 'number')
                    newItem.setWithPriority(itemData, priority);
                else
                    newItem.setWithPriority(itemData, priority);
            }
            else {
                newItem.set(itemData);
            }

            return key;
        }

        update(key: string, item: T, priority?: number|string) {
            var itemData = item['toJSON'] ? item['toJSON']() : item;
            var itemRef = this.ref.child(key);

            if (priority) {
                if (typeof priority === 'number')
                    itemRef.setWithPriority(itemData, priority);
                else
                    itemRef.setWithPriority(itemData, priority);
            }
            else {
                itemRef.set(itemData);
            }
        }

        updatePriority(key: string, priority: number|string) {
            var itemRef = this.ref.child(key);
            if (typeof priority === 'number')
                itemRef.setPriority(priority);
            else
                itemRef.setPriority(priority);
        }

        remove(key: string) {
            var itemRef = this.ref.child(key)
            if (itemRef) {
                itemRef.remove();
            }
        }

        withValue(attr: string, key: string, snapChild: string) {
            return m.withAttr(attr, value => {
                var ref = this.ref.child(key).child(snapChild).ref();
                ref.set(value);
            });
        }

        dispose() {
            if (this.query) {
                this.query.off('child_added');
                this.query.off('child_removed');
                this.query.off('child_changed');
                this.query.off('child_moved');
                this.query = null;
            }
            this.data = null;
            this.ref = null;
        }
    }
}