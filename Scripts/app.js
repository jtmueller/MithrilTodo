var TodoApp;
(function (TodoApp) {
    //the controller defines what part of the model is relevant for the current page
    //in our case, there's only one view-model that handles everything
    var TodoController = (function () {
        function TodoController() {
            var _this = this;
            TodoApp.Auth.init().then(function (authData) {
                if (authData) {
                    m.startComputation();
                    _this.authData = authData;
                    _this.store = new TodoStore(_this.authData);
                    _this.dialogController = new Bootstrap.Modal.ModalController();
                    _this.vm = new ViewModel(_this.store, _this.dialogController);
                    m.endComputation();
                }
            }, function (err) { return console.error(err); });
            window.addEventListener('keydown', this.keyDownHandler);
        }
        TodoController.prototype.login = function (provider) {
            TodoApp.Auth.authenticate(provider);
        };
        TodoController.prototype.keyDownHandler = function (e) {
            if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
                // user pressed ctrl+shift+L - log them out
                TodoApp.Auth.logout();
                document.location.reload();
            }
        };
        TodoController.prototype.onunload = function (e) {
            this.store.unload();
            window.removeEventListener('keydown', this.keyDownHandler);
        };
        return TodoController;
    })();
    TodoApp.TodoController = TodoController;
    function view(ctrl) {
        if (!ctrl)
            return null;
        if (!ctrl.authData) {
            return renderLoginBox(ctrl);
        }
        var vm = ctrl.vm;
        var items = vm.list.getItems();
        var todoGroups = Utils.groupSize(items, 5);
        return m('.container.todoApp', [
            m('.row', m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1', renderInputForm(vm))),
            m('.row', todoGroups.map(function (group) { return m('.col-lg-4', group.map(renderToDo.bind(undefined, vm))); })),
            Bootstrap.Modal.view(ctrl.dialogController)
        ]);
    }
    TodoApp.view = view;
    //the view-model tracks a running list of todos,
    //stores a description for new todos before they are created
    //and takes care of the logic surrounding when adding is permitted
    //and clearing the input after adding a todo to the list
    var ViewModel = (function () {
        function ViewModel(store, dialogController) {
            this.dialogController = dialogController;
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
        ViewModel.prototype.remove = function (key, description) {
            var _this = this;
            var content = confirmDialog(description);
            this.dialogController.show(content).then(function (button) {
                if (button === Bootstrap.Modal.Button.Yes) {
                    _this.list.remove(key);
                }
            });
        };
        return ViewModel;
    })();
    var Todo = (function () {
        function Todo(text, completed, key) {
            if (completed === void 0) { completed = false; }
            this.text = m.prop(text);
            this.completed = m.prop(completed);
            this.key = key;
        }
        Todo.prototype.toJSON = function () {
            return {
                text: this.text(),
                completed: this.completed()
            };
        };
        Todo.fromJSON = function (data, key) {
            return new Todo(data.text, data.completed, key);
        };
        return Todo;
    })();
    var TodoStore = (function () {
        function TodoStore(authData) {
            var _this = this;
            this.authData = authData;
            this.todos = [];
            this.ref = new Firebase("" + TodoApp.Config.firebaseUrl + "/users/" + authData.uid + "/todos");
            this.ref.on('value', function (data) {
                _this.todos = [];
                data.forEach(function (x) {
                    // TODO: use more granular events for better efficiency
                    _this.todos.push(Todo.fromJSON(x.val(), x.key()));
                });
                m.redraw();
            });
        }
        TodoStore.prototype.getItems = function () {
            return this.todos;
        };
        TodoStore.prototype.push = function (item) {
            var newItem = this.ref.push();
            newItem.set(item.toJSON());
        };
        TodoStore.prototype.remove = function (key) {
            this.ref.child(key).remove();
        };
        TodoStore.prototype.update = function (item) {
            this.ref.child(item.key).update(item.toJSON());
        };
        TodoStore.prototype.unload = function () {
            this.ref.off('value');
            this.ref = null;
        };
        return TodoStore;
    })();
    var Modal = Bootstrap.Modal;
    function confirmDialog(description) {
        return {
            title: 'Delete Task?',
            buttons: [{
                text: 'Yes',
                value: Modal.Button.Yes,
                primary: true
            }, {
                text: 'No',
                value: Modal.Button.No
            }],
            content: function () { return m('.confirmDlg', [
                'Are you sure you want to permanently delete this task?',
                m('.panel.panel-default', m('.panel-body', description))
            ]); }
        };
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
            m('.col-xs-8', m("label.todo" + (task.completed() ? '.completed' : ''), {
                htmlFor: 'todo_' + task.key,
            }, task.text())),
            m('.col-xs-2', m('.icon-close', m('i.mdi-content-clear.close', {
                onclick: vm.remove.bind(vm, task.key, task.text()) // Utils.fadesOut(vm.remove.bind(vm, task.key), '.panel')
            })))
        ]));
    }
    function renderLoginBox(ctrl) {
        return m('.container.todoApp', m('.row', m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1', m('.authBox.well', [
            m('.row', m('.col-xs-10.col-xs-offset-1', m('h3', 'Mithril Todo'))),
            m('.row', m('.col-xs-10.col-xs-offset-1', 'Please log in to access your private to-do list.')),
            m('.row', m('button.google.btn.btn-raised.btn-material-red-600[type=button]', { onclick: ctrl.login.bind(ctrl, TodoApp.AuthProvider.google) }, ['Google', m('.ripple-wrapper')]))
        ]))));
    }
    TodoApp.Module = {
        controller: TodoController,
        view: view
    };
})(TodoApp || (TodoApp = {}));
//initialize the application
m.module(document.body, TodoApp.Module);
//# sourceMappingURL=app.js.map