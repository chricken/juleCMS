'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import lang from "../lang.js";
import ajax from "../ajax.js";
import CompInput from "../components/Input/Input.js";

// Wird als Callback an index.js übergeben, damit nach erfolgreichem Login
// der normale Init durchlaufen kann
let onSuccess = () => {};

const viewLogin = ({onLoginSuccess = () => {}} = {}) => {
    onSuccess = onLoginSuccess;

    // Alles leeren – wirklich leer, kein Content
    elements.nav.innerHTML = '';
    elements.main.innerHTML = '';

    const container = dom.create({
        cssClassName: 'login-container',
        parent: elements.main,
    })

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('loginTitle'),
        parent: container,
    })

    let password = '';

    const elError = dom.create({
        tagName: 'p',
        cssClassName: 'login-error',
        parent: container,
    })

    const inpPassword = CompInput({
        parent: container,
        legend: lang.getPhrase('password'),
        isPassword: true,
        hasClearButton: false,
        onInput: (val) => {
            password = val;
            if (password.length > 0) {
                elButton.removeAttribute('disabled');
            } else {
                elButton.setAttribute('disabled', true);
            }
        },
        onClear: () => {
            password = '';
            elButton.setAttribute('disabled', true);
        }
    })

    const elButton = dom.create({
        tagName: 'button',
        content: lang.getPhrase('loginButton'),
        cssClassName: 'login-button',
        parent: container,
        attr: {
            disabled: true,
            type: 'button',
            tabindex: '-1'
        },
        listeners: {
            click() {
                if (!password) return;
                elError.innerText = '';
                elButton.setAttribute('disabled', true);
                ajax.login(password).then(
                    result => {
                        if (result.status === 'success' && result.authenticated) {
                            onSuccess();
                        } else {
                            elError.innerText = lang.getPhrase('wrongPassword');
                            elError.className = 'login-error visible';
                            inpPassword.clear();
                            password = '';
                            elButton.setAttribute('disabled', true);
                        }
                    }
                ).catch(
                    () => {
                        elError.innerText = lang.getPhrase('loginError');
                        elError.className = 'login-error visible';
                        elButton.removeAttribute('disabled');
                    }
                )
            }
        }
    })

    // Enter-Taste im Passwortfeld soll Login auslösen
    inpPassword.focus();
}

export default viewLogin;
