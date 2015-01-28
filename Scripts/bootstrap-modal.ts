module Bootstrap.Modal {

    export class ModalController {
        vm: ModalViewModel;
        private dlgResult: MithrilDeferred<any>;

        constructor() {
            this.vm = new ModalViewModel();
            this.hide = this.hide.bind(this);
        }

        show<T>(opts: ModalOptions): MithrilPromise<T> {
            if (this.dlgResult) {
                return this.dlgResult.promise;
            }

            this.dlgResult = m.deferred<T>();
            this.vm.show(opts);

            return this.dlgResult.promise;
        }

        hide(result?: any) {
            this.dlgResult.resolve(result);
            this.dlgResult = null;
            this.vm.hide();
        }
    }

    export function view(ctrl: ModalController) {
        var vm = ctrl.vm;
        if (!vm.render) return null;

        return m('.modal' + (vm.visible ? '.fade.in' : '.fade'),
            m('.modal-dialog',
                m('.modal-content', [
                    m('.modal-header', [
                        m('button.close[type=button][aria-label=Close]',
                            { onclick: ctrl.hide },
                            m('span[aria-hidden=true]', m.trust('&times;'))
                        ),
                        m('h4.modal-title', vm.title)
                    ]),
                    m('.modal-body', vm.content()),
                    m('.modal-footer', renderButtons(ctrl))
                ])
            )
        );
    }

    export type ModalContentView = () => (MithrilVirtualElement|MithrilVirtualElement[]);

    export enum Button {
        Ok, Cancel, Yes, No, Apply, Save, Delete
    }

    export interface ModalButton {
        text: string;
        value: any;
        primary?: boolean;
    }

    export interface ModalOptions {
        title: string;
        content: ModalContentView;
        buttons: ModalButton[];
    }

    class ModalViewModel {
        render: boolean;
        visible: boolean;
        content: ModalContentView;
        buttons: ModalButton[];
        title: string;

        show(opts: ModalOptions) {
            m.startComputation();
            this.title = opts.title;
            this.content = opts.content;
            this.buttons = opts.buttons;
            this.render = true;
            this.visible = false;
            m.endComputation();

            setTimeout(() => {
                // this allows for CSS animations to fade-in on the element
                this.visible = true;
                m.redraw();
            }, 16);
        }

        hide() {
            this.visible = false;
            m.redraw();

            setTimeout(() => {
                // this allows for CSS animations to fade-out the element before it's removed from the dom
                this.render = false;
                m.redraw();
            }, 250); // css animation lasts 0.15 seconds, or 200ms
        }
    }

    function renderButtons(ctrl: ModalController) {
        return ctrl.vm.buttons.map(btn => {
            var btnClass = btn.primary ? 'btn-primary' : 'btn-default';
            return m(`button.btn.${ btnClass }[type=button]`,
                { onclick: ctrl.hide.bind(ctrl, btn.value) }, btn.text);
        });
    }

    export var Module: MithrilModule = {
        controller: ModalController,
        view: view
    }
}