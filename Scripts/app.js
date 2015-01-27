var TodoApp;
(function (TodoApp) {
    var Todo = (function () {
        function Todo(text, completed, key) {
            if (completed === void 0) { completed = false; }
            this.text = m.prop(text);
            this.completed = m.prop(completed);
            this.key = key;
        }
        Todo.prototype.toObj = function () {
            return {
                text: this.text(),
                completed: this.completed()
            };
        };
        Todo.fromObj = function (data, key) {
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
                    _this.todos.push(Todo.fromObj(x.val(), x.key()));
                });
                m.redraw();
            });
        }
        TodoStore.prototype.getItems = function () {
            return this.todos;
        };
        TodoStore.prototype.push = function (item) {
            var newItem = this.ref.push();
            newItem.set(item.toObj());
        };
        TodoStore.prototype.remove = function (key) {
            this.ref.child(key).remove();
        };
        TodoStore.prototype.update = function (item) {
            this.ref.child(item.key).update(item.toObj());
        };
        TodoStore.prototype.unload = function () {
            this.ref.off('value');
            this.ref = null;
        };
        return TodoStore;
    })();
    var Modal = Bootstrap.Modal;
    var confirmDialog = Modal.create({
        title: 'Delete Task?',
        buttons: [{
            text: 'Yes',
            id: 2 /* Yes */,
            primary: true
        }, {
            text: 'No',
            id: 3 /* No */
        }]
    });
    function confirmContent(description) {
        return function () { return m('.confirmDlg', [
            'Are you sure you want to permanently delete this task?',
            m('.panel.panel-default', m('.panel-body', description))
        ]); };
    }
    var ViewModel = (function () {
        function ViewModel(store, dialogController) {
            this.dialogController = dialogController;
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
        ViewModel.prototype.remove = function (key, description) {
            var _this = this;
            var content = confirmContent(description);
            this.dialogController.show(content).then(function (button) {
                if (button === 2 /* Yes */) {
                    _this.list.remove(key);
                }
            });
        };
        return ViewModel;
    })();
    var Controller = (function () {
        function Controller() {
            var _this = this;
            TodoApp.Auth.init().then(function (authData) {
                if (authData) {
                    m.startComputation();
                    _this.authData = authData;
                    _this.store = new TodoStore(_this.authData);
                    _this.dialogController = confirmDialog.controllerFactory();
                    _this.vm = new ViewModel(_this.store, _this.dialogController);
                    m.endComputation();
                }
            }, function (err) { return console.error(err); });
            window.addEventListener('keydown', function (ev) {
                if (ev.shiftKey && ev.ctrlKey && ev.keyCode === 76) {
                    TodoApp.Auth.logout();
                    document.location.reload();
                }
            });
        }
        Controller.prototype.login = function (provider) {
            TodoApp.Auth.authenticate(provider);
        };
        Controller.prototype.onunload = function (e) {
            this.store.unload();
        };
        return Controller;
    })();
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
                onclick: vm.remove.bind(vm, task.key, task.text())
            })))
        ]));
    }
    function renderLoginBox(controller) {
        return m('.container.todoApp', m('.row', m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1', m('.authBox.well', [
            m('.row', m('.col-xs-10.col-xs-offset-1', m('h3', 'Mithril Todo'))),
            m('.row', m('.col-xs-10.col-xs-offset-1', 'Please log in to access your private to-do list.')),
            m('.row', m('button.google.btn.btn-raised.btn-material-red-600[type=button]', { onclick: controller.login.bind(controller, 0 /* google */) }, [
                'Google',
                m('.ripple-wrapper')
            ]))
        ]))));
    }
    function view(controller) {
        if (!controller.authData) {
            return renderLoginBox(controller);
        }
        var vm = controller.vm;
        var items = vm.list.getItems();
        var todoGroups = Utils.groupSize(items, 5);
        return m('.container.todoApp', [
            m('.row', m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1', renderInputForm(vm))),
            m('.row', todoGroups.map(function (group) { return m('.col-lg-4', group.map(renderToDo.bind(undefined, vm))); })),
            confirmDialog.view(controller.dialogController)
        ]);
    }
    TodoApp.Module = {
        controller: Controller,
        view: view
    };
})(TodoApp || (TodoApp = {}));
m.module(document.body, TodoApp.Module);
