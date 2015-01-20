module TodoApp {

    //the Todo class has two properties
    class Todo {
        text: (value?: string) => string;
        completed: (value?: boolean) => boolean;
        key: string;

        constructor(text: string, completed = false, key?: string) {
            this.text = m.prop(text);
            this.completed = m.prop(completed);
            this.key = key;
        }

        toJson() {
            return {
                key: this.key,
                text: this.text(),
                completed: this.completed()
            };
        }
    }

    class TodoStore {
        private firebaseRef: Firebase;
        private todos: Todo[];

        constructor() {
            this.todos = [];
            this.firebaseRef = new Firebase("https://hrbo-todo.firebaseio.com/todos/");
            this.firebaseRef.on('value', data => {
                m.startComputation();
                this.todos = [];
                data.forEach(x => {
                    var item = x.val();
                    //console.log(item);
                    this.todos.push(new Todo(item.text, item.completed, item.key));
                });
                m.endComputation();
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

    function groupSize<T>(items: T[], size: number) {
        var output: T[][] = [];
        var group: T[] = [];

        items.forEach((item, i) => {
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
    export var controller = Controller;

    export function view(controller: Controller) {
        var vm = controller.vm;
        var items = vm.list.getItems();
        var todoGroups = groupSize(items, 5);

        return m('.container.todoApp', [
            m('.row',
                m('.col-md-4.col-md-offset-4.col-xs-10',
                    m('form', { onsubmit: vm.add }, [
                        m('.form-group', m('.form-control-wrapper', [
                            m('input.form-control[type=text]', {
                                placeholder: 'What needs to be done?',
                                onkeypress: m.withAttr('value', vm.description),
                                value: vm.description()
                            }),
                            m('span.material-input')
                        ]))
                    ])
                )
            ),
            m('.row', [
                todoGroups.map(todos =>
                    m('.col-lg-4', [
                        todos.map((task: Todo) =>
                            m('.panel.panel-default', { key: task.key },
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
                                        m('.icon-close', { onclick: vm.remove.bind(vm, task.key) },
                                            m('i.mdi-content-clear.close'))
                                    )
                                ])
                            )
                        )
                    ])
                )
            ])
        ]);
    }
}

//initialize the application
m.module(document.body, TodoApp);