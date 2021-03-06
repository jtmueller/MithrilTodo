﻿module TodoApp {
    import Modal = Bootstrap.Modal;

    //the controller defines what part of the model is relevant for the current page
    //in our case, there's only one view-model that handles everything
    export class TodoController {
        vm: ViewModel;
        store: MithrilFireStore<Todo>;
        dialogController: Modal.ModalController;
        authData: FirebaseAuthData;

        constructor() {
            this.init();
            this.keyDownHandler = this.keyDownHandler.bind(this);
            window.addEventListener('keydown', this.keyDownHandler);
        }

        private init() {
            Auth.init().then(authData => {
                if (authData) {
                    m.startComputation();
                    this.authData = authData;
                    var ref = new Firebase(`${Config.firebaseUrl}/users/${authData.uid}/todos`);
                    this.store = new MithrilFireStore<Todo>(ref.limitToLast(100), x => Todo.fromJSON(x.val(), x.key()));
                    this.dialogController = new Modal.ModalController()
                    this.vm = new ViewModel(this.store, this.dialogController);
                    m.endComputation();
                }
            }, err => console.error(err));
        }

        login(provider: AuthProvider) {
            Auth.authenticate(provider);
        }

        private keyDownHandler(e) {
            if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
                // user pressed ctrl+shift+L - log them out
                m.startComputation();
                this.authData = null;
                this.store.dispose();
                Auth.logout();
                this.init();
                m.endComputation();
            }
        }

        onunload(e) {
            this.store.dispose();
            window.removeEventListener('keydown', this.keyDownHandler);
        }
    }

    export function view(ctrl: TodoController) {
        if (!ctrl.authData) {
            return renderLoginBox(ctrl);
        }

        var vm = ctrl.vm;
        var todoGroups = _(vm.list.asArray()).chunk(5);

        return m('.container.todoApp', [
            m('.row',
                m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1',
                    renderInputForm(vm)
                )
            ),
            m('.row', 
                todoGroups.map(group => {
                    var renderItem = renderToDo.bind(undefined, vm);
                    return m('.col-lg-4', _.map(group, renderItem));
                }).value()
            ),
            Modal.view(ctrl.dialogController)
        ]);
    }

    //the view-model tracks a running list of todos,
    //stores a description for new todos before they are created
    //and takes care of the logic surrounding when adding is permitted
    //and clearing the input after adding a todo to the list
    class ViewModel {
        /** a slot to store the name of a new todo before it is created */
        description = m.prop('');

        constructor(public list: MithrilFireStore<Todo>, private dialogController: Modal.ModalController) {
            this.add = this.add.bind(this);
        }

        /** adds a todo to the list, and clears the description field for user convenience */
        add(e: Event) {
            e.preventDefault();
            if (this.description()) {
                this.list.push(new Todo(this.description()));
                this.description('');
            }
        }

        update(item: Todo) {
            this.list.update(item.key(), item);
        }

        remove(key: string, description: string) {
            var content = confirmDialog(description);

            this.dialogController.show<Modal.Button>(content)
                .then(button => {
                    if (button === Modal.Button.Yes) {
                        this.list.remove(key);
                    }
                });
        }
    }

    interface TodoData {
        text: string;
        completed: boolean;
    }

    class Todo {
        text = m.prop('');
        completed = m.prop(false);
        key = m.prop<string>();

        constructor(text: string, completed = false, key?: string) {
            this.text(text);
            this.completed(completed);
            this.key(key);
        }

        toJSON(): TodoData {
            return {
                text: this.text(),
                completed: this.completed()
            };
        }

        static fromJSON(data: TodoData, key: string) {
            return new Todo(data.text, data.completed, key);
        }
    }

    function confirmDialog(description: string): Modal.ModalOptions {
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
            content: () => m('.confirmDlg', [
                'Are you sure you want to permanently delete this task?',
                m('.panel.panel-default', m('.panel-body', description))
            ])
        };
    }

    function renderInputForm(vm: ViewModel) {
        return m('form', { onsubmit: vm.add }, [
            m('.form-group',
                m('.form-control-wrapper', [
                    m('input.form-control[type=text]', {
                        placeholder: 'What needs to be done?',
                        onkeypress: m.withAttr('value', vm.description),
                        value: vm.description()
                    }),
                    m('span.material-input')
                ])
            )
        ])
    }

    function renderToDo(vm: ViewModel, task: Todo) {
        return m('.panel.panel-default', { key: task.key() },
            m('.panel-body', [
                m('.col-xs-2',
                    m('.checkbox',
                        m('label', [
                            m('input[type=checkbox]', {
                                id: 'todo_' + task.key(),
                                onclick: e => {
                                    task.completed(e.target.checked);
                                    vm.update(task);
                                },
                                checked: task.completed()
                            }),
                            m('span.ripple'),
                            m('span.check')
                        ])
                    )
                ),
                m('.col-xs-8',
                    m('label.todo' + (task.completed() ? '.completed' : ''), {
                        htmlFor: 'todo_' + task.key(),
                    }, task.text())
                ),
                m('.col-xs-2',
                    m('.icon-close', 
                        m('i.mdi-content-clear.close', {
                            onclick: vm.remove.bind(vm, task.key(), task.text())  // Utils.fadesOut(vm.remove.bind(vm, task.key, task.text()), '.panel')
                        })
                    )
                )
            ])
        );
    }

    function renderLoginBox(ctrl: TodoController) {
        return m('.container.todoApp', m('.row',
            m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1',
                m('.authBox.well', [
                    m('.row', m('.col-xs-10.col-xs-offset-1', m('h3', 'Mithril Todo'))),
                    m('.row', m('.col-xs-10.col-xs-offset-1', 'Please log in to access your private to-do list.')),
                    m('.row',
                        m('button.google.btn.btn-raised.btn-material-red-600[type=button]',
                            { onclick: ctrl.login.bind(ctrl, AuthProvider.google) },
                            ['Google', m('.ripple-wrapper')]
                        )
                    )
                ])
            )
        ));
    }

    export var Module: MithrilModule = {
        controller: TodoController,
        view: view
    }
}

//initialize the application
m.module(document.body, TodoApp.Module);