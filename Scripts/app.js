var TodoApp;
(function (TodoApp) {
    var Todo = (function () {
        function Todo(text, completed, key) {
            if (completed === void 0) { completed = false; }
            this.text = m.prop(text);
            this.completed = m.prop(completed);
            this.key = key;
        }
        Todo.prototype.toJson = function () {
            return {
                key: this.key,
                text: this.text(),
                completed: this.completed()
            };
        };
        return Todo;
    })();
    var TodoStore = (function () {
        function TodoStore() {
            var _this = this;
            this.todos = [];
            this.firebaseRef = new Firebase("https://hrbo-todo.firebaseio.com/todos/");
            this.firebaseRef.on('value', function (data) {
                _this.todos = [];
                data.forEach(function (x) {
                    var item = x.val();
                    _this.todos.push(new Todo(item.text, item.completed, item.key));
                });
                m.redraw();
            });
        }
        TodoStore.prototype.getItems = function () {
            return this.todos;
        };
        TodoStore.prototype.push = function (item) {
            var newItem = this.firebaseRef.push();
            item.key = newItem.key();
            newItem.set(item.toJson());
        };
        TodoStore.prototype.remove = function (key) {
            this.firebaseRef.child(key).remove();
        };
        TodoStore.prototype.update = function (item) {
            this.firebaseRef.child(item.key).update(item.toJson());
        };
        TodoStore.prototype.unload = function () {
            this.firebaseRef.off('value');
            this.firebaseRef = null;
        };
        return TodoStore;
    })();
    var ViewModel = (function () {
        function ViewModel(store) {
            this.list = store;
            this.description = m.prop('');
            this.add = this.add.bind(this);
        }
        ViewModel.prototype.add = function (e) {
            e.preventDefault();
            if (this.description()) {
                this.list.push(new Todo(this.description()));
                this.description('');
            }
        };
        ViewModel.prototype.update = function (item) {
            this.list.update(item);
        };
        ViewModel.prototype.remove = function (key) {
            this.list.remove(key);
        };
        return ViewModel;
    })();
    var Controller = (function () {
        function Controller() {
            this.store = new TodoStore();
            this.vm = new ViewModel(this.store);
        }
        Controller.prototype.onunload = function (e) {
            this.store.unload();
        };
        return Controller;
    })();
    function groupSize(items, size) {
        var output = [];
        var group = [];
        items.forEach(function (item, i) {
            var didPush = false;
            if (i > 0 && i % size === 0) {
                output.push(group);
                group = [];
                didPush = true;
            }
            group.push(item);
            if (!didPush && i === items.length - 1) {
                output.push(group);
            }
        });
        return output;
    }
    function renderInputForm(vm) {
        return m('form', { onsubmit: vm.add }, [
            m('.form-group', m('.form-control-wrapper', [
                m('input.form-control[type=text]', {
                    placeholder: 'What needs to be done?',
                    onkeypress: m.withAttr('value', vm.description),
                    value: vm.description()
                }),
                m('span.material-input')
            ]))
        ]);
    }
    function renderToDo(vm, task) {
        return m('.panel.panel-default', { key: task.key }, m('.panel-body', [
            m('.col-xs-2', m('.checkbox', m('label', [
                m('input[type=checkbox]', {
                    id: 'todo_' + task.key,
                    onclick: function (e) {
                        task.completed(e.target.checked);
                        vm.update(task);
                    },
                    checked: task.completed()
                }),
                m('span.ripple'),
                m('span.check')
            ]))),
            m('.col-xs-8', m('label.todo', {
                htmlFor: 'todo_' + task.key,
                style: {
                    textDecoration: task.completed() ? 'line-through' : 'none',
                    color: task.completed() ? 'silver' : 'inherit'
                }
            }, task.text())),
            m('.col-xs-2', m('.icon-close', { onclick: vm.remove.bind(vm, task.key) }, m('i.mdi-content-clear.close')))
        ]));
    }
    function view(controller) {
        var vm = controller.vm;
        var items = vm.list.getItems();
        var todoGroups = groupSize(items, 5);
        return m('.container.todoApp', [
            m('.row', m('.col-md-4.col-md-offset-4.col-xs-10', renderInputForm(vm))),
            m('.row', todoGroups.map(function (group) { return m('.col-lg-4', group.map(renderToDo.bind(undefined, vm))); }))
        ]);
    }
    TodoApp.Module = {
        controller: Controller,
        view: view
    };
})(TodoApp || (TodoApp = {}));
m.module(document.body, TodoApp.Module);
