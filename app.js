var Utils,Bootstrap,TodoApp;(function(n){var t;(function(n){n.firebaseUrl="https://hrbo-todo.firebaseio.com"})(t=n.Config||(n.Config={}))})(TodoApp||(TodoApp={})),function(n){function i(n,t){var r=[],i=[];return n.forEach(function(u,f){f>0&&f%t==0&&(r.push(i),i=[]);i.push(u);f===n.length-1&&r.push(i)}),r}function t(n,t){for(var r=t.charAt(0),i=n;i&&i!==document;i=i.parentNode)if(r==="."&&i.classList.contains(t.substr(1))||r==="#"&&i.id===t.substr(1)||r==="["&&i.hasAttribute(t.substr(1,t.length-2))||i.tagName.toLowerCase()===t)return i;return null}function r(n,i){return function(r){m.redraw.strategy("none");var u=r.target;i&&(u=t(u,i));u?Velocity(u,{opacity:0},{duration:750,complete:function(){m.startComputation();n();m.endComputation()}}):(m.startComputation(),n(),m.endComputation())}}n.groupSize=i;n.getClosest=t;n.fadesOut=r}(Utils||(Utils={})),function(n){var t;(function(n){function r(n){return n.options.buttons.map(function(t){var i=t.primary?"btn-primary":"btn-default";return m("button.btn."+i+"[type=button]",{onclick:n.hide.bind(n,t.id)},t.text)})}function u(n){return n.vm.render?m(".modal.fade"+(n.vm.visible?".in":""),m(".modal-dialog",m(".modal-content",[m(".modal-header",[m("button.close[type=button][aria-label=Close]",{onclick:n.hide},m("span[aria-hidden=true]",m.trust("&times;"))),m("h4.modal-title",n.options.title)]),m(".modal-body",n.vm.content()),m(".modal-footer",r(n))]))):null}function f(n){return{controllerFactory:function(){return new t(n)},view:u}}(function(n){n[n.Ok=0]="Ok";n[n.Cancel=1]="Cancel";n[n.Yes=2]="Yes";n[n.No=3]="No";n[n.Apply=4]="Apply";n[n.Save=5]="Save";n[n.Delete=6]="Delete"})(n.Button||(n.Button={}));var e=n.Button,i=function(){function n(){}return n}(),t=function(){function n(n){this.options=n;this.vm=new i;this.hide=this.hide.bind(this)}return n.prototype.show=function(n){var t=this;return this.dlgResult?this.dlgResult.promise:(m.startComputation(),this.vm.content=n,this.vm.render=!0,this.vm.visible=!1,this.dlgResult=m.deferred(),m.endComputation(),setTimeout(function(){m.startComputation();t.vm.visible=!0;m.endComputation()},10),this.dlgResult.promise)},n.prototype.hide=function(n){var t=this;m.startComputation();this.vm.visible=!1;this.dlgResult.resolve(n);this.dlgResult=null;m.endComputation();setTimeout(function(){m.startComputation();t.vm.render=!1;m.endComputation()},250)},n}();n.ModalController=t;n.create=f})(t=n.Modal||(n.Modal={}))}(Bootstrap||(Bootstrap={})),function(n){(function(n){n[n.google=0]="google";n[n.facebook=1]="facebook";n[n.twitter=2]="twitter";n[n.github=3]="github"})(n.AuthProvider||(n.AuthProvider={}));var t=n.AuthProvider,i;(function(i){function f(){if(!r){r=new Firebase(n.Config.firebaseUrl);r.onAuth(function(n){n&&(n.token=null,u.resolve(n),r.child("/users/"+n.uid).update(n))})}return u.promise}function e(n){r&&r.getAuth()||r.authWithOAuthPopup(t[n],function(n){n&&u.reject(n)})}function o(){r&&r.unauth()}var r=null,u=m.deferred();i.init=f;i.authenticate=e;i.logout=o})(i=n.Auth||(n.Auth={}))}(TodoApp||(TodoApp={})),function(n){function f(n){return function(){return m(".confirmDlg",["Are you sure you want to permanently delete this task?",m(".panel.panel-default",m(".panel-body",n))])}}function s(n){return m("form",{onsubmit:n.add},[m(".form-group",m(".form-control-wrapper",[m("input.form-control[type=text]",{placeholder:"What needs to be done?",onkeypress:m.withAttr("value",n.description),value:n.description()}),m("span.material-input")]))])}function h(n,t){return m(".panel.panel-default",{key:t.key},m(".panel-body",[m(".col-xs-2",m(".checkbox",m("label",[m("input[type=checkbox]",{id:"todo_"+t.key,onclick:function(i){t.completed(i.target.checked);n.update(t)},checked:t.completed()}),m("span.ripple"),m("span.check")]))),m(".col-xs-8",m("label.todo",{htmlFor:"todo_"+t.key,style:{textDecoration:t.completed()?"line-through":"none",color:t.completed()?"silver":"inherit"}},t.text())),m(".col-xs-2",m(".icon-close",m("i.mdi-content-clear.close",{onclick:n.remove.bind(n,t.key,t.text())})))]))}function c(n){return m(".container.todoApp",m(".row",m(".col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1",m(".authBox.well",[m(".row",m(".col-xs-offset-1",m("h3","Mithril Todo"))),m(".row",m(".col-xs-offset-1","Please log in to access your private to-do list.")),m(".row",m(".col-xs-offset-4",m("button.google.btn.btn-raised.btn-material-red-600[type=button]",{onclick:n.login.bind(n,0)},["Google",m(".ripple-wrapper")])))]))))}function l(n){if(!n.authData)return c(n);var t=n.vm,r=t.list.getItems(),u=Utils.groupSize(r,5);return m(".container.todoApp",[m(".row",m(".col-md-4.col-md-offset-4.col-xs-10.col-xs-offset-1",s(t))),m(".row",u.map(function(n){return m(".col-lg-4",n.map(h.bind(undefined,t)))})),i.view(n.dialogController)])}var t=function(){function n(n,t,i){t===void 0&&(t=!1);this.text=m.prop(n);this.completed=m.prop(t);this.key=i}return n.prototype.toObj=function(){return{text:this.text(),completed:this.completed()}},n.fromObj=function(t,i){return new n(t.text,t.completed,i)},n}(),r=function(){function i(i){var r=this;this.authData=i;this.todos=[];this.ref=new Firebase(""+n.Config.firebaseUrl+"/users/"+i.uid+"/todos");this.ref.on("value",function(n){r.todos=[];n.forEach(function(n){r.todos.push(t.fromObj(n.val(),n.key()))});m.redraw()})}return i.prototype.getItems=function(){return this.todos},i.prototype.push=function(n){var t=this.ref.push();t.set(n.toObj())},i.prototype.remove=function(n){this.ref.child(n).remove()},i.prototype.update=function(n){this.ref.child(n.key).update(n.toObj())},i.prototype.unload=function(){this.ref.off("value");this.ref=null},i}(),u=Bootstrap.Modal,i=u.create({title:"Delete Task?",buttons:[{text:"Yes",id:2,primary:!0},{text:"No",id:3}]}),e=function(){function n(n,t){this.dialogController=t;this.list=n;this.description=m.prop("");this.add=this.add.bind(this)}return n.prototype.add=function(n){n.preventDefault();this.description()&&(this.list.push(new t(this.description())),this.description(""))},n.prototype.update=function(n){this.list.update(n)},n.prototype.remove=function(n,t){var i=this,r=f(t);this.dialogController.show(r).then(function(t){t===2&&i.list.remove(n)})},n}(),o=function(){function t(){var t=this;n.Auth.init().then(function(n){n&&(m.startComputation(),t.authData=n,t.store=new r(t.authData),t.dialogController=i.controllerFactory(),t.vm=new e(t.store,t.dialogController),m.endComputation())},function(n){return console.error(n)});window.addEventListener("keydown",function(t){t.shiftKey&&t.ctrlKey&&t.keyCode===76&&(n.Auth.logout(),document.location.reload())})}return t.prototype.login=function(t){n.Auth.authenticate(t)},t.prototype.onunload=function(){this.store.unload()},t}();n.Module={controller:o,view:l}}(TodoApp||(TodoApp={}));m.module(document.body,TodoApp.Module)