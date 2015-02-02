var TodoApp;
(function (TodoApp) {
    var MithrilFireStore = (function () {
        function MithrilFireStore(query, converter) {
            var _this = this;
            this.query = query;
            this.data = [];
            this.convert = converter || (function (x) { return x.val(); });
            this.ref = query.ref();
            this.query.on('child_added', function (data) {
                m.startComputation();
                var item = _this.convert(data);
                _this.data.push(item);
                m.endComputation();
            });
            this.query.on('child_removed', function (snapshot) {
                m.startComputation();
                var key = snapshot.key();
                _.remove(_this.data, function (x) { return x.key() === key; });
                m.endComputation();
            });
            this.query.on('child_changed', function (snapshot) {
                m.startComputation();
                var newItem = _this.convert(snapshot);
                var itemIndex = _.findIndex(_this.data, function (x) { return x.key() === newItem.key(); });
                if (itemIndex !== -1) {
                    _this.data[itemIndex] = newItem;
                }
                m.endComputation();
            });
            this.query.on('child_moved', function (snapshot, prevKey) {
                console.log('child_moved', snapshot, prevKey);
                m.startComputation();
                var thisKey = snapshot.key();
                var removed = _.remove(_this.data, function (x) { return x.key() === thisKey; });
                if (removed.length === 0)
                    return;
                if (prevKey) {
                    var prevIndex = _.findIndex(_this.data, function (x) { return x.key() === prevKey; });
                    if (prevIndex === -1)
                        _this.data.push(removed[0]);
                    else
                        _this.data.splice(prevIndex, 0, removed[0]);
                }
                else {
                    _this.data.unshift(removed[0]);
                }
                m.endComputation();
            });
        }
        Object.defineProperty(MithrilFireStore.prototype, "length", {
            get: function () {
                return this.data.length;
            },
            enumerable: true,
            configurable: true
        });
        MithrilFireStore.prototype.asArray = function () {
            return this.data;
        };
        MithrilFireStore.prototype.filter = function (predicate) {
            return _.filter(this.data, predicate);
        };
        MithrilFireStore.prototype.forEach = function (fn) {
            return _.forEach(this.data, fn);
        };
        MithrilFireStore.prototype.map = function (fn) {
            return _.map(this.data, fn);
        };
        MithrilFireStore.prototype.reduce = function (fn, initValue) {
            return _.reduce(this.data, fn, initValue);
        };
        MithrilFireStore.prototype.push = function (item, priority) {
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
        };
        MithrilFireStore.prototype.update = function (key, item, priority) {
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
        };
        MithrilFireStore.prototype.updatePriority = function (key, priority) {
            var itemRef = this.ref.child(key);
            if (typeof priority === 'number')
                itemRef.setPriority(priority);
            else
                itemRef.setPriority(priority);
        };
        MithrilFireStore.prototype.remove = function (key) {
            var itemRef = this.ref.child(key);
            if (itemRef) {
                itemRef.remove();
            }
        };
        MithrilFireStore.prototype.withValue = function (attr, key, snapChild) {
            var _this = this;
            return m.withAttr(attr, function (value) {
                var ref = _this.ref.child(key).child(snapChild).ref();
                ref.set(value);
            });
        };
        MithrilFireStore.prototype.dispose = function () {
            if (this.query) {
                this.query.off('child_added');
                this.query.off('child_removed');
                this.query.off('child_changed');
                this.query.off('child_moved');
                this.query = null;
            }
            this.data = null;
            this.ref = null;
        };
        return MithrilFireStore;
    })();
    TodoApp.MithrilFireStore = MithrilFireStore;
})(TodoApp || (TodoApp = {}));
