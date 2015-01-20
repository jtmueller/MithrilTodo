var TodoApp;
(function (TodoApp) {
    //the Todo class has two properties
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
                m.startComputation();
                _this.todos = [];
                data.forEach(function (x) {
                    var item = x.val();
                    //console.log(item);
                    _this.todos.push(new Todo(item.text, item.completed, item.key));
                });
                m.endComputation();
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
    //the view-model tracks a running list of todos,
    //stores a description for new todos before they are created
    //and takes care of the logic surrounding when adding is permitted
    //and clearing the input after adding a todo to the list
    var ViewModel = (function () {
        function ViewModel(store) {
            this.list = store;
            this.description = m.prop('');
            this.add = this.add.bind(this);
        }
        /** adds a todo to the list, and clears the description field for user convenience */
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
    //the controller defines what part of the model is relevant for the current page
    //in our case, there's only one view-model that handles everything
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
    // following are the functions expected of MithrilModule:
    TodoApp.controller = Controller;
    function view(controller) {
        var vm = controller.vm;
        var items = vm.list.getItems();
        var todoGroups = groupSize(items, 5);
        return m('.container.todoApp', [
            m('.row', m('.col-md-4.col-md-offset-4.col-xs-10', m('form', { onsubmit: vm.add }, [
                m('.form-group', m('.form-control-wrapper', [
                    m('input.form-control[type=text]', {
                        placeholder: 'What needs to be done?',
                        onkeypress: m.withAttr('value', vm.description),
                        value: vm.description()
                    }),
                    m('span.material-input')
                ]))
            ]))),
            m('.row', [
                todoGroups.map(function (todos) { return m('.col-lg-4', [
                    todos.map(function (task) { return m('.panel.panel-default', { key: task.key }, m('.panel-body', [
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
                    ])); })
                ]); })
            ])
        ]);
    }
    TodoApp.view = view;
})(TodoApp || (TodoApp = {}));
//initialize the application
m.module(document.body, TodoApp);
//# sourceMappingURL=app.js.map