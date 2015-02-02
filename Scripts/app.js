var TodoApp;
(function (TodoApp) {
    var Modal = Bootstrap.Modal;
    var TodoController = (function () {
        function TodoController() {
            this.init();
            this.keyDownHandler = this.keyDownHandler.bind(this);
            window.addEventListener('keydown', this.keyDownHandler);
        }
        TodoController.prototype.init = function () {
            var _this = this;
            TodoApp.Auth.init().then(function (authData) {
                if (authData) {
                    m.startComputation();
                    _this.authData = authData;
                    var ref = new Firebase("" + TodoApp.Config.firebaseUrl + "/users/" + authData.uid + "/todos");
                    _this.store = new TodoApp.MithrilFireStore(ref.limitToLast(100), function (x) { return Todo.fromJSON(x.val(), x.key()); });
                    _this.dialogController = new Modal.ModalController();
                    _this.vm = new ViewModel(_this.store, _this.dialogController);
                    m.endComputation();
                }
            }, function (err) { return console.error(err); });
        };
        TodoController.prototype.login = function (provider) {
            TodoApp.Auth.authenticate(provider);
        };
        TodoController.prototype.keyDownHandler = function (e) {
            if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
                this.authData = null;
                this.store.dispose();
                TodoApp.Auth.logout();
                this.init();
            }
        };
        TodoController.prototype.onunload = function (e) {
            this.store.dispose();
            window.removeEventListener('keydown', this.keyDownHandler);
        };
        return TodoController;
    })();
    TodoApp.TodoController = TodoController;
    function view(ctrl) {
        if (!ctrl.authData) {
            return renderLoginBox(ctrl);
        }
        var vm = ctrl.vm;
        var todoGroups = Utils.groupSize(vm.list, 5);
        return m('.container.todoApp', [
            m('.row', m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1', renderInputForm(vm))),
            m('.row', todoGroups.map(function (group) { return m('.col-lg-4', group.map(renderToDo.bind(undefined, vm))); })),
            Modal.view(ctrl.dialogController)
        ]);
    }
    TodoApp.view = view;
    var ViewModel = (function () {
        function ViewModel(list, dialogController) {
            this.list = list;
            this.dialogController = dialogController;
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
            this.list.update(item.key(), item);
        };
        ViewModel.prototype.remove = function (key, description) {
            var _this = this;
            var content = confirmDialog(description);
            this.dialogController.show(content).then(function (button) {
                if (button === 2 /* Yes */) {
                    _this.list.remove(key);
                }
            });
        };
        return ViewModel;
    })();
    var Todo = (function () {
        function Todo(text, completed, key) {
            if (completed === void 0) { completed = false; }
            this.text = m.prop('');
            this.completed = m.prop(false);
            this.key = m.prop();
            this.text(text);
            this.completed(completed);
            this.key(key);
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
    function confirmDialog(description) {
        return {
            title: 'Delete Task?',
            buttons: [{
                text: 'Yes',
                value: 2 /* Yes */,
                primary: true
            }, {
                text: 'No',
                value: 3 /* No */
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
        return m('.panel.panel-default', { key: task.key() }, m('.panel-body', [
            m('.col-xs-2', m('.checkbox', m('label', [
                m('input[type=checkbox]', {
                    id: 'todo_' + task.key(),
                    onclick: function (e) {
                        task.completed(e.target.checked);
                        vm.update(task);
                    },
                    checked: task.completed()
                }),
                m('span.ripple'),
                m('span.check')
            ]))),
            m('.col-xs-8', m('label.todo' + (task.completed() ? '.completed' : ''), {
                htmlFor: 'todo_' + task.key(),
            }, task.text())),
            m('.col-xs-2', m('.icon-close', m('i.mdi-content-clear.close', {
                onclick: vm.remove.bind(vm, task.key(), task.text())
            })))
        ]));
    }
    function renderLoginBox(ctrl) {
        return m('.container.todoApp', m('.row', m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1', m('.authBox.well', [
            m('.row', m('.col-xs-10.col-xs-offset-1', m('h3', 'Mithril Todo'))),
            m('.row', m('.col-xs-10.col-xs-offset-1', 'Please log in to access your private to-do list.')),
            m('.row', m('button.google.btn.btn-raised.btn-material-red-600[type=button]', { onclick: ctrl.login.bind(ctrl, 0 /* google */) }, ['Google', m('.ripple-wrapper')]))
        ]))));
    }
    TodoApp.Module = {
        controller: TodoController,
        view: view
    };
})(TodoApp || (TodoApp = {}));
m.module(document.body, TodoApp.Module);
