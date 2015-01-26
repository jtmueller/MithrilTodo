module TodoApp {

    interface TodoData {
        text: string;
        completed: boolean;
    }

    class Todo {
        text: (value?: string) => string;
        completed: (value?: boolean) => boolean;
        key: string;

        constructor(text: string, completed = false, key?: string) {
            this.text = m.prop(text);
            this.completed = m.prop(completed);
            this.key = key;
        }

        toObj(): TodoData {
            return {
                text: this.text(),
                completed: this.completed()
            };
        }

        static fromObj(data: TodoData, key: string) {
            return new Todo(data.text, data.completed, key);
        }
    }

    class TodoStore {
        private ref: Firebase;
        private todos: Todo[];

        constructor(private authData: FirebaseAuthData) {
            this.todos = [];
            this.ref = new Firebase(`${Config.firebaseUrl}/users/${authData.uid}/todos`);
            this.ref.on('value', data => {
                this.todos = [];
                data.forEach(x => {
                    //console.log(x.val());
                    this.todos.push(Todo.fromObj(x.val(), x.key()));
                });
                m.redraw();
            });
        }

        getItems() {
            return this.todos;
        }

        push(item: Todo) {
            var newItem = this.ref.push();
            newItem.set(item.toObj());
        }

        remove(key: string) {
            this.ref
                .child(key)
                .remove();
        }

        update(item: Todo) {
            this.ref
                .child(item.key)
                .update(item.toObj());
        }

        unload() {
            this.ref.off('value');
            this.ref = null;
        }
    }

    var Modal = Bootstrap.Modal;

    var confirmDialog = Modal.create({
        title: 'Delete Task?',
        buttons: [{
            text: 'Yes',
            id: Modal.Button.Yes,
            primary: true
        }, {
            text: 'No',
            id: Modal.Button.No
        }]
    });

    function confirmContent(description: string) {
        return () =>
            m('.confirmDlg', [
                'Are you sure you want to permanently delete this task?',
                m('.panel.panel-default', m('.panel-body', description))
            ]);
    }

    //the view-model tracks a running list of todos,
    //stores a description for new todos before they are created
    //and takes care of the logic surrounding when adding is permitted
    //and clearing the input after adding a todo to the list
    class ViewModel {
        /** a running list of todos */
        list: TodoStore;
        /** a slot to store the name of a new todo before it is created */
        description: (value?: string) => string;

        constructor(store: TodoStore, private dialogController: Bootstrap.Modal.ModalController) {
            this.list = store;
            this.description = m.prop('');
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
            this.list.update(item);
        }

        remove(key: string, description: string) {
            var content = confirmContent(description);

            this.dialogController.show<Bootstrap.Modal.Button>(content)
                .then(button => {
                    if (button === Bootstrap.Modal.Button.Yes) {
                        this.list.remove(key);
                    }
                });
        }
    }

    //the controller defines what part of the model is relevant for the current page
    //in our case, there's only one view-model that handles everything
    class Controller {
        vm: ViewModel;
        store: TodoStore;
        dialogController: Bootstrap.Modal.ModalController;
        authData: FirebaseAuthData;

        constructor() {
            Auth.login().then(authData => {
                if (authData) {
                    m.startComputation();
                    this.authData = authData;
                    this.store = new TodoStore(this.authData);
                    this.dialogController = confirmDialog.controllerFactory();
                    this.vm = new ViewModel(this.store, this.dialogController);
                    m.endComputation();
                }
            },
            err => console.error(err));
        }

        onunload(e) {
            this.store.unload();
        }
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
        return m('.panel.panel-default', { key: task.key },
            m('.panel-body', [
                m('.col-xs-2',
                    m('.checkbox',
                        m('label', [
                            m('input[type=checkbox]', {
                                id: 'todo_' + task.key,
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
                    m('label.todo', {
                        htmlFor: 'todo_' + task.key,
                        style: {
                            textDecoration: task.completed() ? 'line-through' : 'none',
                            color: task.completed() ? 'silver' : 'inherit'
                        }
                    }, task.text())
                ),
                m('.col-xs-2',
                    m('.icon-close', 
                        m('i.mdi-content-clear.close', {
                            onclick: vm.remove.bind(vm, task.key, task.text())  // Utils.fadesOut(vm.remove.bind(vm, task.key), '.panel')
                        })
                    )
                )
            ])
        );
    }

    function view(controller: Controller) {
        if (!controller.authData) return null;

        var vm = controller.vm;
        var items = vm.list.getItems();
        var todoGroups = Utils.groupSize(items, 5);

        return m('.container.todoApp', [
            m('.row',
                m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1',
                    renderInputForm(vm)
                )
            ),
            m('.row', todoGroups.map(group =>
                m('.col-lg-4', group.map(renderToDo.bind(undefined, vm))))
            ),
            confirmDialog.view(controller.dialogController)
        ]);
    }

    export var Module: MithrilModule = {
        controller: Controller,
        view: view
    }
}

//initialize the application
m.module(document.body, TodoApp.Module);