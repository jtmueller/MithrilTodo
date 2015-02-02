var TodoApp;
(function (TodoApp) {
    var MithrilFireStore = (function () {
        function MithrilFireStore(query, converter) {
            var _this = this;
            this.query = query;
            this.ref = query.ref();
            this.convert = converter || (function (x) { return x.val(); });
            // TODO: instead of value use child_added, child_removed, child_changed events, local cache?
            this.query.on('value', function (data) {
                _this.data = data;
                m.redraw();
            });
        }
        Object.defineProperty(MithrilFireStore.prototype, "length", {
            get: function () {
                if (this.data)
                    return this.data.numChildren();
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        MithrilFireStore.prototype.asArray = function () {
            var _this = this;
            var out = [];
            if (!this.data)
                return out;
            this.data.forEach(function (item) {
                var value = _this.convert(item);
                out.push(value);
            });
            return out;
        };
        MithrilFireStore.prototype.filter = function (predicate) {
            var _this = this;
            var out = [];
            if (!this.data)
                return out;
            this.data.forEach(function (item) {
                var value = _this.convert(item);
                if (predicate(value)) {
                    out.push(value);
                }
            });
            return out;
        };
        MithrilFireStore.prototype.forEach = function (fn) {
            var _this = this;
            if (!this.data)
                return;
            this.data.forEach(function (x) { return fn(_this.convert(x)); });
        };
        MithrilFireStore.prototype.map = function (fn) {
            var _this = this;
            var out = [];
            this.data.forEach(function (item) {
                out.push(fn(_this.convert(item)));
            });
            return out;
        };
        MithrilFireStore.prototype.reduce = function (fn, initValue) {
            var _this = this;
            if (!this.data)
                return initValue;
            var val = initValue;
            this.data.forEach(function (item) {
                val = fn(val, _this.convert(item), item.key(), _this.data);
            });
            return val;
        };
        MithrilFireStore.prototype.snapshot = function () {
            return this.data;
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
                this.query.off('value');
                this.query = null;
            }
            this.data = null;
            this.ref = null;
        };
        return MithrilFireStore;
    })();
    TodoApp.MithrilFireStore = MithrilFireStore;
})(TodoApp || (TodoApp = {}));
//# sourceMappingURL=mithrilFire.js.map