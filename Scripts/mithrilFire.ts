module TodoApp {
	export class MithrilFireStore<T> {
		private ref: Firebase;
		private data: FirebaseDataSnapshot;
		private convert: (value: FirebaseDataSnapshot) => T;

		constructor(private query: FirebaseQuery, converter?: (value: FirebaseDataSnapshot) => T) {
			this.ref = query.ref();
			this.convert = converter || (x => <T>x.val());

			// TODO: instead of value use child_added, child_removed, child_changed events, local cache?
			this.query.on('value', data => {
				this.data = data;
				m.redraw();
			});
		}

		get length() {
			if (this.data)
				return this.data.numChildren();
			return 0;
		}

		asArray(): T[] {
			var out: T[] = [];
			if (!this.data)
				return out;

			this.data.forEach(item => {
				var value = this.convert(item);
				out.push(value);
			});

			return out;
		}

		filter(predicate: (item:T) => boolean) {
			var out: T[] = [];
			if (!this.data)
				return out;

			this.data.forEach(item => {
				var value = this.convert(item);
				if (predicate(value)) {
					out.push(value);
				}
			});

			return out;
		}

		forEach(fn: (item:T) => void) {
			if (!this.data) return;
			this.data.forEach(x => fn(this.convert(x)));
		}

		map<R>(fn: (item: T) => R): R[]{
			var out: R[] = [];

			this.data.forEach(item => {
				out.push(fn(this.convert(item)));
			});

			return out;
		}

		reduce<R>(fn: (accumulator:R, item:T, key?:string, data?:FirebaseDataSnapshot) => R, initValue:R) {
			if (!this.data) return initValue;
			var val = initValue;
			this.data.forEach(item => {
				val = fn(val, this.convert(item), item.key(), this.data);
			});
			return val;
		}

		snapshot() {
			return this.data;
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
				this.query.off('value');
				this.query = null;
			}
			this.data = null;
			this.ref = null;
		}
	}
}