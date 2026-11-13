'use strict';

import elements from "../elements.js";
import dom from "../dom.js";
import data from "../data.js";
import lang from "../lang.js";
import ajax from "../ajax.js";
import helpers from "../helpers.js";
import CompInput from "../components/Input/Input.js";
import CompCheckbox from "../components/Checkbox/Checkbox.js";
import TranslationButtons from "../components/TranslationButtons/TranslationButtons.js";
import CompSelect from "../components/Select/Select.js";

const viewSettings = () => {

    elements.main.innerHTML = '';

    // Alten Scroll-Handler entfernen (bei View-Wechsel)
    if (elements.settingsScrollHandler) {
        window.removeEventListener('scroll', elements.settingsScrollHandler);
        elements.settingsScrollHandler = null;
    }

    const layout = dom.create({
        cssClassName: 'settings-layout',
        parent: elements.main,
    })

    // ===== Linke Seite: Menü (sticky) =====
    const aside = dom.create({
        cssClassName: 'settings-menu',
        parent: layout,
    })

    dom.create({
        tagName: 'h1',
        content: lang.getPhrase('settings'),
        parent: aside,
    })

    const menuItems = {};

    const addMenuItem = ({key, label}) => {
        menuItems[key] = dom.create({
            tagName: 'span',
            cssClassName: 'settings-menu-item',
            content: label,
            parent: aside,
            attr: {
                'data-target': 'settings-' + key,
                tabindex: '-1'
            },
            listeners: {
                click(evt) {
                    evt.stopPropagation();
                    showSection(key);
                }
            }
        })
    }

    const sectionKeys = ['cms', 'personal', 'tech', 'api'];

    const showSection = (key) => {
        sectionKeys.forEach(k => {
            const el = document.getElementById('settings-' + k);
            if (el) el.style.display = (k === key) ? '' : 'none';
            if (menuItems[k]) menuItems[k].classList.toggle('active', k === key);
        });
    }

    addMenuItem({key: 'cms', label: lang.getPhrase('settingsCMS')})
    addMenuItem({key: 'personal', label: lang.getPhrase('settingsPersonal')})
    addMenuItem({key: 'tech', label: lang.getPhrase('settingsTech')})
    addMenuItem({key: 'api', label: lang.getPhrase('settingsApi')})

    // ===== Rechte Seite: Inhalt =====
    const content = dom.create({
        cssClassName: 'settings-content',
        parent: layout,
    })

    // ==================== CMS ====================
    const secCMS = dom.create({
        tagName: 'section',
        cssClassName: 'settings-section',
        parent: content,
        attr: {id: 'settings-cms'}
    })

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('settingsCMS'),
        parent: secCMS,
    })

    dom.create({
        tagName: 'p',
        content: lang.getPhrase('maxImageResolution'),
        parent: secCMS,
    })

    dom.create({
        tagName: 'p',
        cssClassName: 'settings-hint',
        content: lang.getPhrase('maxImageResolutionHint'),
        parent: secCMS,
    })

    const elMaxResFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secCMS,
    })

    const saveMaxResDebounced = helpers.debouncer((val) => {
        ajax.saveMaxImageResolution(val).then(
            result => {
                if (result.status === 'success') {
                    elMaxResFeedback.innerText = lang.getPhrase('maxImageResolutionSaved') + ' ' + result.maxImageResolution + 'px';
                    elMaxResFeedback.className = 'email-feedback success';
                }
            }
        ).catch(
            () => {
                elMaxResFeedback.innerText = lang.getPhrase('emailSaveError');
                elMaxResFeedback.className = 'email-feedback error';
            }
        )
    }, 800)

    const inpMaxRes = CompInput({
        parent: secCMS,
        legend: lang.getPhrase('maxImageResolution'),
        hasClearButton: false,
        onInput: (val) => {
            elMaxResFeedback.innerText = '';
            elMaxResFeedback.className = 'email-feedback';
            const px = parseInt(val, 10);
            if (!isNaN(px) && px >= 160) saveMaxResDebounced(px);
        }
    })

    ajax.loadMaxImageResolution().then(
        result => { if (result.maxImageResolution) inpMaxRes.set(String(result.maxImageResolution)); }
    )

    // ==================== Persönlich ====================
    const secPersonal = dom.create({
        tagName: 'section',
        cssClassName: 'settings-section',
        parent: content,
        attr: {id: 'settings-personal'}
    })

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('settingsPersonal'),
        parent: secPersonal,
    })

    // --- Passwort ---
    dom.create({
        tagName: 'h3',
        content: lang.getPhrase('password'),
        parent: secPersonal,
    })

    let password1 = '';
    let password2 = '';

    const validate = () => {
        const bothFilled = password1.length > 0 && password2.length > 0;
        const match = password1 === password2;

        if (!bothFilled) {
            elMatchInfo.innerText = '';
            elMatchInfo.className = 'password-match-info';
            elButton.setAttribute('disabled', true);
        } else if (!match) {
            elMatchInfo.innerText = lang.getPhrase('passwordsDontMatch');
            elMatchInfo.className = 'password-match-info mismatch';
            elButton.setAttribute('disabled', true);
        } else {
            elMatchInfo.innerText = lang.getPhrase('passwordsMatch');
            elMatchInfo.className = 'password-match-info match';
            elButton.removeAttribute('disabled');
        }
    }

    const inpPassword1 = CompInput({
        parent: secPersonal,
        legend: lang.getPhrase('newPassword'),
        isPassword: true,
        hasClearButton: true,
        onInput: (val) => { password1 = val; validate(); },
        onClear: () => { password1 = ''; validate(); }
    })

    const inpPassword2 = CompInput({
        parent: secPersonal,
        legend: lang.getPhrase('repeatPassword'),
        isPassword: true,
        hasClearButton: true,
        onInput: (val) => { password2 = val; validate(); },
        onClear: () => { password2 = ''; validate(); }
    })

    const elMatchInfo = dom.create({
        tagName: 'p',
        cssClassName: 'password-match-info',
        parent: secPersonal,
    })

    const elFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'password-feedback',
        parent: secPersonal,
    })

    const elButton = dom.create({
        tagName: 'button',
        content: lang.getPhrase('savePassword'),
        cssClassName: 'save-password-button',
        parent: secPersonal,
        attr: {disabled: true, type: 'button', tabindex: '-1'},
        listeners: {
            click() {
                if (password1 === password2 && password1.length > 0) {
                    elFeedback.innerText = '';
                    ajax.savePassword(password1).then(
                        result => {
                            if (result.status === 'success') {
                                elFeedback.innerText = lang.getPhrase('passwordSaved');
                                elFeedback.className = 'password-feedback success';
                                inpPassword1.clear();
                                inpPassword2.clear();
                                password1 = '';
                                password2 = '';
                                validate();
                            } else {
                                elFeedback.innerText = lang.getPhrase('passwordSaveError');
                                elFeedback.className = 'password-feedback error';
                            }
                        }
                    ).catch(
                        () => {
                            elFeedback.innerText = lang.getPhrase('passwordSaveError');
                            elFeedback.className = 'password-feedback error';
                        }
                    )
                }
            }
        }
    })

    // --- Admin-E-Mail ---
    dom.create({tagName: 'hr', parent: secPersonal})
    dom.create({tagName: 'h3', content: lang.getPhrase('adminEmail'), parent: secPersonal})

    const elEmailFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secPersonal,
    })

    const saveEmailDebounced = helpers.debouncer((email) => {
        ajax.saveAdminEmail(email).then(
            result => {
                if (result.status === 'success') {
                    elEmailFeedback.innerText = lang.getPhrase('emailSaved');
                    elEmailFeedback.className = 'email-feedback success';
                } else {
                    elEmailFeedback.innerText = lang.getPhrase('emailSaveError');
                    elEmailFeedback.className = 'email-feedback error';
                }
            }
        ).catch(
            () => {
                elEmailFeedback.innerText = lang.getPhrase('emailSaveError');
                elEmailFeedback.className = 'email-feedback error';
            }
        )
    }, 800)

    const inpEmail = CompInput({
        parent: secPersonal,
        legend: lang.getPhrase('adminEmail'),
        toLowerCase: true,
        hasClearButton: true,
        onInput: (val) => {
            elEmailFeedback.innerText = '';
            elEmailFeedback.className = 'email-feedback';
            saveEmailDebounced(val);
        },
        onClear: () => {
            elEmailFeedback.innerText = '';
            saveEmailDebounced('');
        }
    })

    ajax.loadAdminEmail().then(
        result => { if (result.adminEmail) inpEmail.set(result.adminEmail); }
    )

    // --- Testmail ---
    dom.create({tagName: 'hr', parent: secPersonal})

    const elMailFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secPersonal,
    })

    dom.create({
        tagName: 'button',
        content: lang.getPhrase('sendTestMail'),
        cssClassName: 'save-password-button testmail-button',
        parent: secPersonal,
        attr: {type: 'button', tabindex: '-1'},
        listeners: {
            click() {
                elMailFeedback.innerText = '';
                elMailFeedback.className = 'email-feedback';
                ajax.sendTestMail().then(
                    result => {
                        if (result.status === 'success') {
                            elMailFeedback.innerText = result.sent
                                ? lang.getPhrase('testMailSent') + ' (' + result.to + ')'
                                : lang.getPhrase('testMailSaved') + ' (' + result.to + ')';
                            elMailFeedback.className = 'email-feedback success';
                        } else if (result.msg && result.msg.includes('Keine Admin-E-Mail')) {
                            elMailFeedback.innerText = lang.getPhrase('noAdminEmail');
                            elMailFeedback.className = 'email-feedback error';
                        } else {
                            elMailFeedback.innerText = lang.getPhrase('testMailError') + ' ' + (result.msg || '');
                            elMailFeedback.className = 'email-feedback error';
                        }
                    }
                ).catch(
                    () => {
                        elMailFeedback.innerText = lang.getPhrase('testMailError');
                        elMailFeedback.className = 'email-feedback error';
                    }
                )
            }
        }
    })

    // --- Zusätzliche Test-Nachricht (textarea) ---
    dom.create({
        tagName: 'p',
        cssClassName: 'settings-hint',
        content: lang.getPhrase('testMailMessageHint'),
        parent: secPersonal,
    })

    const elMsgFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secPersonal,
    })

    const saveMsgDebounced = helpers.debouncer((msg) => {
        ajax.saveTestMailMessage(msg).then(
            result => {
                if (result.status === 'success') {
                    elMsgFeedback.innerText = lang.getPhrase('testMailMessageSaved');
                    elMsgFeedback.className = 'email-feedback success';
                }
            }
        ).catch(
            () => {
                elMsgFeedback.innerText = lang.getPhrase('emailSaveError');
                elMsgFeedback.className = 'email-feedback error';
            }
        )
    }, 800)

    const inpTestMsg = CompInput({
        parent: secPersonal,
        legend: lang.getPhrase('testMailMessage'),
        multiline: true,
        hasClearButton: true,
        onInput: (val) => {
            elMsgFeedback.innerText = '';
            elMsgFeedback.className = 'email-feedback';
            saveMsgDebounced(val);
        },
        onClear: () => { saveMsgDebounced(''); }
    })

    ajax.loadTestMailMessage().then(
        result => { if (result.testMailMessage) inpTestMsg.set(result.testMailMessage); }
    )

    // --- Login-Gültigkeit ---
    dom.create({tagName: 'hr', parent: secPersonal})
    dom.create({tagName: 'h3', content: lang.getPhrase('loginValidity'), parent: secPersonal})

    const elValidityFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secPersonal,
    })

    const saveValidityDebounced = helpers.debouncer((days) => {
        ajax.saveLoginValidityDays(days).then(
            result => {
                if (result.status === 'success') {
                    elValidityFeedback.innerText = lang.getPhrase('loginValiditySaved') + ' (' + result.loginValidityDays + 'd)';
                    elValidityFeedback.className = 'email-feedback success';
                }
            }
        ).catch(
            () => {
                elValidityFeedback.innerText = lang.getPhrase('emailSaveError');
                elValidityFeedback.className = 'email-feedback error';
            }
        )
    }, 800)

    const inpValidity = CompInput({
        parent: secPersonal,
        legend: lang.getPhrase('loginValidity'),
        hasClearButton: false,
        onInput: (val) => {
            elValidityFeedback.innerText = '';
            elValidityFeedback.className = 'email-feedback';
            const days = parseInt(val, 10);
            if (!isNaN(days) && days > 0) saveValidityDebounced(days);
        }
    })

    ajax.loadLoginValidityDays().then(
        result => { if (result.loginValidityDays) inpValidity.set(String(result.loginValidityDays)); }
    )

    // ==================== Tech ====================
    const secTech = dom.create({
        tagName: 'section',
        cssClassName: 'settings-section',
        parent: content,
        attr: {id: 'settings-tech'}
    })

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('settingsTech'),
        parent: secTech,
    })

    // --- SMTP ---
    dom.create({tagName: 'h3', content: lang.getPhrase('smtpSettings'), parent: secTech})

    const elSmtpFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secTech,
    })

    let smtp = {smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', smtpSecure: false};

    const saveSmtpDebounced = helpers.debouncer(() => {
        ajax.saveSmtpSettings(smtp).then(
            result => {
                if (result.status === 'success') {
                    elSmtpFeedback.innerText = lang.getPhrase('smtpSaved');
                    elSmtpFeedback.className = 'email-feedback success';
                } else {
                    elSmtpFeedback.innerText = lang.getPhrase('emailSaveError');
                    elSmtpFeedback.className = 'email-feedback error';
                }
            }
        ).catch(
            () => {
                elSmtpFeedback.innerText = lang.getPhrase('emailSaveError');
                elSmtpFeedback.className = 'email-feedback error';
            }
        )
    }, 800)

    const inpSmtpHost = CompInput({
        parent: secTech,
        legend: lang.getPhrase('smtpHost'),
        hasClearButton: true,
        onInput: (val) => { smtp.smtpHost = val; elSmtpFeedback.innerText = ''; saveSmtpDebounced(); },
        onClear: () => { smtp.smtpHost = ''; saveSmtpDebounced(); }
    })

    const inpSmtpPort = CompInput({
        parent: secTech,
        legend: lang.getPhrase('smtpPort'),
        hasClearButton: true,
        onInput: (val) => { smtp.smtpPort = parseInt(val, 10) || 587; elSmtpFeedback.innerText = ''; saveSmtpDebounced(); },
        onClear: () => { smtp.smtpPort = 587; saveSmtpDebounced(); }
    })

    const inpSmtpUser = CompInput({
        parent: secTech,
        legend: lang.getPhrase('smtpUser'),
        hasClearButton: true,
        onInput: (val) => { smtp.smtpUser = val; elSmtpFeedback.innerText = ''; saveSmtpDebounced(); },
        onClear: () => { smtp.smtpUser = ''; saveSmtpDebounced(); }
    })

    const inpSmtpPass = CompInput({
        parent: secTech,
        legend: lang.getPhrase('smtpPass') + ' ' + lang.getPhrase('smtpPassHint'),
        isPassword: true,
        hasClearButton: true,
        onInput: (val) => { smtp.smtpPass = val; elSmtpFeedback.innerText = ''; saveSmtpDebounced(); },
        onClear: () => { smtp.smtpPass = ''; }
    })

    const inpSmtpSecure = CompCheckbox({
        parent: secTech,
        legend: lang.getPhrase('smtpSecure'),
        value: false,
        onChanged: (val) => { smtp.smtpSecure = val; elSmtpFeedback.innerText = ''; saveSmtpDebounced(); }
    })

    ajax.loadSmtpSettings().then(
        result => {
            if (result.smtpHost) inpSmtpHost.set(result.smtpHost);
            if (result.smtpPort) inpSmtpPort.set(String(result.smtpPort));
            if (result.smtpUser) inpSmtpUser.set(result.smtpUser);
            if (result.smtpSecure) inpSmtpSecure.set(true);
            smtp = {
                smtpHost: result.smtpHost || '',
                smtpPort: result.smtpPort || 587,
                smtpUser: result.smtpUser || '',
                smtpPass: '',
                smtpSecure: !!result.smtpSecure
            };
        }
    )


    // ==================== API (LLM) ====================
    const secApi = dom.create({
        tagName: 'section',
        cssClassName: 'settings-section',
        parent: content,
        attr: {id: 'settings-api'}
    })

    dom.create({
        tagName: 'h2',
        content: lang.getPhrase('settingsApi'),
        parent: secApi,
    })

    const llmProviders = ['mistral', 'gemini', 'claude', 'openai', 'langdock'];

    const llmModels = {
        mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest'],
        gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
        claude: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
        openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1'],
        langdock: ['langdock-default'],
    };

    let llm = {provider: '', model: '', apiKey: '', spellcheck: true};

    const elLlmFeedback = dom.create({
        tagName: 'p',
        cssClassName: 'email-feedback',
        parent: secApi,
    })

    const saveLlmDebounced = helpers.debouncer(() => {
        ajax.saveLlmSettings(llm).then(
            result => {
                if (result.status === 'success') {
                    elLlmFeedback.innerText = lang.getPhrase('llmSaved');
                    elLlmFeedback.className = 'email-feedback success';
                }
            }
        ).catch(
            () => {
                elLlmFeedback.innerText = lang.getPhrase('emailSaveError');
                elLlmFeedback.className = 'email-feedback error';
            }
        )
    }, 800)

    const modelContainer = dom.create({
        parent: secApi,
    })

    let selModel = null;

    const renderModelSelect = () => {
        modelContainer.innerHTML = '';
        const models = llmModels[llm.provider] || [];
        const options = [{value: '', label: lang.getPhrase('llmSelectModel')}].concat(
            models.map(m => ({value: m, label: m}))
        );
        selModel = CompSelect({
            parent: modelContainer,
            legend: lang.getPhrase('llmModel'),
            value: llm.model,
            options,
            onSelected: (val) => { llm.model = val; elLlmFeedback.innerText = ''; saveLlmDebounced(); }
        });
    }

    CompSelect({
        parent: secApi,
        legend: lang.getPhrase('llmProvider'),
        value: llm.provider,
        options: [{value: '', label: lang.getPhrase('llmSelectProvider')}].concat(
            llmProviders.map(p => ({value: p, label: p}))
        ),
        onSelected: (val) => {
            llm.provider = val;
            llm.model = '';
            renderModelSelect();
            elLlmFeedback.innerText = '';
            saveLlmDebounced();
        }
    });

    renderModelSelect();

    CompInput({
        parent: secApi,
        legend: lang.getPhrase('llmApiKey') + ' ' + lang.getPhrase('llmApiKeyHint'),
        isPassword: true,
        hasClearButton: true,
        onInput: (val) => { llm.apiKey = val; elLlmFeedback.innerText = ''; saveLlmDebounced(); },
        onClear: () => { llm.apiKey = ''; }
    })


    // ==================== Übersetzungssprachen (manuell) ====================
    dom.create({
        tagName: 'h3',
        content: lang.getPhrase('manualTranslate'),
        parent: secApi,
    })

    llm.autoTranslate = llm.autoTranslate || {en: false, nl: false, fr: false};

    const saveAutoTranslate = helpers.debouncer(() => {
        ajax.saveLlmSettings(llm).then(
            result => {
                if (result.status === 'success') {
                    TranslationButtons.invalidateCache();
                    elLlmFeedback.innerText = lang.getPhrase('llmSaved');
                    elLlmFeedback.className = 'email-feedback success';
                }
            }
        )
    }, 500)

    const cbEn = CompCheckbox({
        parent: secApi,
        legend: lang.getPhrase('translateEn'),
        value: !!(llm.autoTranslate && llm.autoTranslate.en),
        onChanged: (val) => { llm.autoTranslate.en = val; elLlmFeedback.innerText = ''; saveAutoTranslate(); }
    })

    const cbNl = CompCheckbox({
        parent: secApi,
        legend: lang.getPhrase('translateNl'),
        value: !!(llm.autoTranslate && llm.autoTranslate.nl),
        onChanged: (val) => { llm.autoTranslate.nl = val; elLlmFeedback.innerText = ''; saveAutoTranslate(); }
    })

    const cbFr = CompCheckbox({
        parent: secApi,
        legend: lang.getPhrase('translateFr'),
        value: !!(llm.autoTranslate && llm.autoTranslate.fr),
        onChanged: (val) => { llm.autoTranslate.fr = val; elLlmFeedback.innerText = ''; saveAutoTranslate(); }
    })

    const cbSpell = CompCheckbox({
        parent: secApi,
        legend: lang.getPhrase('spellcheckEnabled'),
        value: llm.spellcheck !== false,
        onChanged: (val) => { llm.spellcheck = val; elLlmFeedback.innerText = ''; saveAutoTranslate(); }
    })

    ajax.loadLlmSettings().then(
        result => {
            llm.provider = result.provider || '';
            llm.model = result.model || '';
            llm.autoTranslate = result.autoTranslate || {en: false, nl: false, fr: false};
            // Checkboxen auf gespeicherten Stand setzen (set() feuert nicht onChanged)
            cbEn.set(!!llm.autoTranslate.en);
            cbNl.set(!!llm.autoTranslate.nl);
            cbFr.set(!!llm.autoTranslate.fr);
            llm.spellcheck = result.spellcheck !== false;
            cbSpell.set(llm.spellcheck);
            // Selects aktualisieren
            const providerSelect = secApi.querySelectorAll('select')[0];
            if (providerSelect) providerSelect.value = llm.provider;
            renderModelSelect();
            if (selModel && llm.model) selModel.get(); // wert bleibt
        }
    )

    // Initiales Segment anzeigen
    showSection('cms');

    elements.allTopNavs['settings']?.highlight()
}

export default viewSettings;
