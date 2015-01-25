module Bootstrap.Modal {

    export type ModalContentView = () => (MithrilVirtualElement|MithrilVirtualElement[]);

    export enum Button {
        Ok, Cancel, Yes, No, Apply, Save, Delete
    }

    export interface ModalButton {
        text: string;
        id: any;
        primary?: boolean;
    }

    export interface ModalOptions {
        title: string;
        buttons: ModalButton[];
    }

    class ModalViewModel {
        render: boolean;
        visible: boolean;
        content: ModalContentView;

        constructor() {
        }
    }

    export class ModalController {
        vm: ModalViewModel;
        private dlgResult: MithrilDeferred<any>;

        constructor(public options: ModalOptions) {
            this.vm = new ModalViewModel();
            this.close = this.close.bind(this);
        }

        show<T>(content: ModalContentView): MithrilPromise<T> {
            if (this.dlgResult) {
                return this.dlgResult.promise;
            }

            m.startComputation();
            this.vm.content = content;
            this.vm.render = true;
            this.vm.visible = false;
            this.dlgResult = m.deferred<T>();
            m.endComputation();

            setTimeout(() => {
                // this allows for CSS animations to fade-in the element
                m.startComputation();
                this.vm.visible = true;
                m.endComputation();
            }, 10);

            return this.dlgResult.promise;
        }

        close(result?: any) {
            m.startComputation();
            this.vm.visible = false;
            this.dlgResult.resolve(result);
            this.dlgResult = null;
            m.endComputation();

            setTimeout(() => {
                // this allows for CSS animations to fade-out the element before it's removed from the dom
                m.startComputation();
                this.vm.render = false;
                m.endComputation();
            }, 250); // css animation lasts 0.15 seconds, or 200ms
        }
    }

    function renderButtons(ctrl: ModalController) {
        return ctrl.options.buttons.map(btn => {
            var btnClass = btn.primary ? 'btn-primary' : 'btn-default';
            return m(`button.btn.${ btnClass }[type=button]`,
                { onclick: ctrl.close.bind(ctrl, btn.id) }, btn.text);
        });
    }

    function view(ctrl: ModalController) {
        if (!ctrl.vm.render) return null;

        return m('.modal.fade' + (ctrl.vm.visible ? '.in' : ''),
            m('.modal-dialog',
                m('.modal-content', [
                    m('.modal-header', [
                        m('button.close[type=button][aria-label=Close]',
                            { onclick: ctrl.close },
                            m('span[aria-hidden=true]', m.trust('&times;'))
                        ),
                        m('h4.modal-title', ctrl.options.title)
                    ]),
                    m('.modal-body', ctrl.vm.content()),
                    m('.modal-footer', renderButtons(ctrl))
                ])
            )
        );
    }

    export function create(options: ModalOptions) {
        return {
            controllerFactory: () => new ModalController(options),
            view: view
        };
    }
}