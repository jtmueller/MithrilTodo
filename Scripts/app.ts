module TodoApp {

    interface TodoData {
        text: string;
        completed: boolean;
        key: string
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

        toJson(): TodoData {
            return {
                key: this.key,
                text: this.text(),
                completed: this.completed()
            };
        }

        static fromJson(data: TodoData) {
            return new Todo(data.text, data.completed, data.key);
        }
    }

    class TodoStore {
        private firebaseRef: Firebase;
        private todos: Todo[];

        constructor() {
            this.todos = [];
            this.firebaseRef = new Firebase("https://hrbo-todo.firebaseio.com/todos/");
            this.firebaseRef.on('value', data => {
                this.todos = [];
                data.forEach(x => {
                    //console.log(x.val());
                    this.todos.push(Todo.fromJson(x.val()));
                });
                m.redraw();
            });
        }

        getItems() {
            return this.todos;
        }

        push(item: Todo) {
            var newItem = this.firebaseRef.push();
            item.key = newItem.key();
            newItem.set(item.toJson());
        }

        remove(key: string) {
            this.firebaseRef
                .child(key)
                .remove();
        }

        update(item: Todo) {
            this.firebaseRef
                .child(item.key)
                .update(item.toJson());
        }

        unload() {
            this.firebaseRef.off('value');
            this.firebaseRef = null;
        }
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

        constructor(store: TodoStore) {
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

        remove(key: string) {
            this.list.remove(key);
        }
    }

    //the controller defines what part of the model is relevant for the current page
    //in our case, there's only one view-model that handles everything
    class Controller {
        vm: ViewModel;
        store: TodoStore;

        constructor() {
            this.store = new TodoStore();
            this.vm = new ViewModel(this.store);
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
                            onclick: Utils.fadesOut(vm.remove.bind(vm, task.key), '.panel')
                        })
                    )
                )
            ])
        );
    }

    function view(controller: Controller) {
        var vm = controller.vm;
        var items = vm.list.getItems();
        var todoGroups = Utils.groupSize(items, 5);

        return m('.container.todoApp', [
            m('.row',
                m('.col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-2',
                    renderInputForm(vm)
                )
            ),
            m('.row', todoGroups.map(group =>
                m('.col-lg-4', group.map(renderToDo.bind(undefined, vm))))
            )
        ]);
    }

    export var Module: MithrilModule = {
        controller: Controller,
        view: view
    }
}

//initialize the application
m.module(document.body, TodoApp.Module);