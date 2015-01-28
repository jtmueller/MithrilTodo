var TodoApp;
(function (TodoApp) {
    (function (AuthProvider) {
        AuthProvider[AuthProvider["google"] = 0] = "google";
        AuthProvider[AuthProvider["facebook"] = 1] = "facebook";
        AuthProvider[AuthProvider["twitter"] = 2] = "twitter";
        AuthProvider[AuthProvider["github"] = 3] = "github";
    })(TodoApp.AuthProvider || (TodoApp.AuthProvider = {}));
    var AuthProvider = TodoApp.AuthProvider;
    var Auth;
    (function (Auth) {
        var ref = null;
        var loginHandle = m.deferred();
        function init() {
            if (!ref) {
                ref = new Firebase(TodoApp.Config.firebaseUrl);
                ref.onAuth(function (authData) {
                    if (authData) {
                        authData.token = null;
                        loginHandle.resolve(authData);
                        //console.log('Authenticated: ', authData);
                        ref.child("/users/" + authData.uid).update(authData);
                    }
                });
            }
            return loginHandle.promise;
        }
        Auth.init = init;
        function authenticate(provider) {
            if (!ref || !ref.getAuth()) {
                ref.authWithOAuthPopup(AuthProvider[provider], function (e) {
                    if (e)
                        loginHandle.reject(e);
                });
            }
        }
        Auth.authenticate = authenticate;
        function logout() {
            if (ref)
                ref.unauth();
        }
        Auth.logout = logout;
    })(Auth = TodoApp.Auth || (TodoApp.Auth = {}));
})(TodoApp || (TodoApp = {}));
//# sourceMappingURL=auth.js.map