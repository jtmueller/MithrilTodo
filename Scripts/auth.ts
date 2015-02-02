module TodoApp {
    export enum AuthProvider {
        google,
        facebook,
        twitter,
        github
    }

    export module Auth {
        var ref: Firebase = null;
        var loginHandle = m.deferred<FirebaseAuthData>();

        export function init() {
            if (!ref) {
                ref = new Firebase(Config.firebaseUrl);

                ref.onAuth(authData => {
                    if (authData) {
                        authData.token = null;
                        loginHandle.resolve(authData);
                        //console.log('Authenticated: ', authData);
                        ref.child(`/users/${authData.uid}`)
                            .update(authData);
                    }
                });
            }

            return loginHandle.promise;
        }

        export function authenticate(provider: AuthProvider) {
            if (!ref || !ref.getAuth()) {
                ref.authWithOAuthPopup(AuthProvider[provider],
                    (e) => { if (e) loginHandle.reject(e); });
            }
        }

        export function logout() {
            if (ref) ref.unauth();
            loginHandle.reject(new Error('Log-out requested.'));
            loginHandle = m.deferred<FirebaseAuthData>();
        }
    }
}
