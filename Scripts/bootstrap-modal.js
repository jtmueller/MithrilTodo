var Bootstrap;
(function (Bootstrap) {
    var Modal;
    (function (Modal) {
        Modal.Module = {
            controller: ModalController,
            view: view
        };
        var ModalController = (function () {
            function ModalController() {
                this.vm = new ModalViewModel();
                this.hide = this.hide.bind(this);
            }
            ModalController.prototype.show = function (opts) {
                if (this.dlgResult) {
                    return this.dlgResult.promise;
                }
                this.dlgResult = m.deferred();
                this.vm.show(opts);
                return this.dlgResult.promise;
            };
            ModalController.prototype.hide = function (result) {
                this.dlgResult.resolve(result);
                this.dlgResult = null;
                this.vm.hide();
            };
            return ModalController;
        })();
        Modal.ModalController = ModalController;
        function view(ctrl) {
            var vm = ctrl.vm;
            if (!vm.render)
                return null;
            return m('.modal' + (vm.visible ? '.fade.in' : '.fade'), m('.modal-dialog', m('.modal-content', [
                m('.modal-header', [
                    m('button.close[type=button][aria-label=Close]', { onclick: ctrl.hide }, m('span[aria-hidden=true]', m.trust('&times;'))),
                    m('h4.modal-title', vm.title)
                ]),
                m('.modal-body', vm.content()),
                m('.modal-footer', renderButtons(ctrl))
            ])));
        }
        Modal.view = view;
        (function (Button) {
            Button[Button["Ok"] = 0] = "Ok";
            Button[Button["Cancel"] = 1] = "Cancel";
            Button[Button["Yes"] = 2] = "Yes";
            Button[Button["No"] = 3] = "No";
            Button[Button["Apply"] = 4] = "Apply";
            Button[Button["Save"] = 5] = "Save";
            Button[Button["Delete"] = 6] = "Delete";
        })(Modal.Button || (Modal.Button = {}));
        var Button = Modal.Button;
        var ModalViewModel = (function () {
            function ModalViewModel() {
            }
            ModalViewModel.prototype.show = function (opts) {
                var _this = this;
                m.startComputation();
                this.title = opts.title;
                this.content = opts.content;
                this.buttons = opts.buttons;
                this.render = true;
                this.visible = false;
                m.endComputation();
                setTimeout(function () {
                    // this allows for CSS animations to fade-in on the element
                    _this.visible = true;
                    m.redraw();
                }, 16);
            };
            ModalViewModel.prototype.hide = function () {
                var _this = this;
                this.visible = false;
                m.redraw();
                setTimeout(function () {
                    // this allows for CSS animations to fade-out the element before it's removed from the dom
                    _this.render = false;
                    m.redraw();
                }, 250); // css animation lasts 0.15 seconds, or 200ms
            };
            return ModalViewModel;
        })();
        function renderButtons(ctrl) {
            return ctrl.vm.buttons.map(function (btn) {
                var btnClass = btn.primary ? 'btn-primary' : 'btn-default';
                return m("button.btn." + btnClass + "[type=button]", { onclick: ctrl.hide.bind(ctrl, btn.value) }, btn.text);
            });
        }
    })(Modal = Bootstrap.Modal || (Bootstrap.Modal = {}));
})(Bootstrap || (Bootstrap = {}));
//# sourceMappingURL=bootstrap-modal.js.map