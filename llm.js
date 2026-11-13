'use strict';

// Generischer LLM-Aufruf für verschiedene Anbieter (manuelle Übersetzung).

import settings from './settings.js';

const langNames = {
    en: 'English',
    nl: 'Dutch',
    fr: 'French',
};

const callLLM = async ({provider, model, apiKey, system, user}) => {
    if (!provider || !apiKey) throw new Error('Kein LLM-Anbieter oder API-Key konfiguriert');

    const messages = [
        {role: 'system', content: system},
        {role: 'user', content: user},
    ];

    let url, headers, body;

    switch (provider) {
        case 'mistral':
            url = 'https://api.mistral.ai/v1/chat/completions';
            headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`};
            body = JSON.stringify({model, messages});
            break;
        case 'openai':
            url = 'https://api.openai.com/v1/chat/completions';
            headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`};
            body = JSON.stringify({model, messages});
            break;
        case 'langdock':
            url = 'https://api.langdock.com/v1/chat/completions';
            headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`};
            body = JSON.stringify({model: model || 'gpt-4o', messages});
            break;
        case 'claude':
            url = 'https://api.anthropic.com/v1/messages';
            headers = {'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01'};
            body = JSON.stringify({model, max_tokens: 1024, system, messages: [{role: 'user', content: user}]});
            break;
        case 'gemini': {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            headers = {'Content-Type': 'application/json'};
            body = JSON.stringify({contents: [{role: 'user', parts: [{text: system + '\n\n' + user}]}]});
            break;
        }
        default:
            throw new Error(`Unbekannter Anbieter: ${provider}`);
    }

    const res = await fetch(url, {method: 'POST', headers, body});
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`LLM-Fehler (${provider}, ${res.status}): ${errText.slice(0, 300)}`);
    }
    const data = await res.json();

    let text = '';
    switch (provider) {
        case 'mistral':
        case 'openai':
        case 'langdock':
            text = data.choices?.[0]?.message?.content ?? '';
            break;
        case 'claude': {
            const c = data.content;
            if (Array.isArray(c)) text = c.map(b => b.text || '').join('');
            else text = typeof c === 'string' ? c : (c?.[0]?.text ?? '');
            break;
        }
        case 'gemini': {
            const parts = data.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) text = parts.map(p => p.text || '').join('');
            else text = parts?.text ?? '';
            break;
        }
    }
    if (Array.isArray(text)) text = text.map(p => (typeof p === 'string' ? p : (p?.text || ''))).join('');
    return typeof text === 'string' ? text.trim() : '';
};

// Übersetzt einen Text von Deutsch in die Zielsprache (manuell angefordert).
const translate = async (text, targetLang) => {
    if (!text || !String(text).trim()) return null;

    let llm;
    try { llm = settings.get('llm') || {}; } catch (e) { throw new Error('Keine LLM-Konfiguration'); }
    if (!llm.provider || !llm.apiKey) throw new Error('Kein LLM-Anbieter oder API-Key konfiguriert');

    const targetName = langNames[targetLang] || targetLang;
    const system = `You are a professional translator. Translate the following German text into ${targetName}. Return ONLY the translation, no explanations, no quotes, no preamble.`;

    return await callLLM({
        provider: llm.provider,
        model: llm.model,
        apiKey: llm.apiKey,
        system,
        user: String(text),
    });
};

// Rechtschreibkorrektur: NUR Rechtschreibung/Tippfehler, Stil/Markdown bleiben unverändert
const spellcheck = async (text) => {
    if (!text || !String(text).trim()) return null;

    let llm;
    try { llm = settings.get('llm') || {}; } catch (e) { throw new Error('Keine LLM-Konfiguration'); }
    if (!llm.provider || !llm.apiKey) throw new Error('Kein LLM-Anbieter oder API-Key konfiguriert');

    const system = 'Du bist ein Lektorat. Korrigiere AUSSCHLIESSLICH die Rechtschreibung und offensichtliche Tippfehler im folgenden deutschen Text. Ändere nichts am Stil, an der Wortwahl, an der Formatierung oder an Markdown-Syntax. Gib NUR den korrigierten Text zurück, ohne Erklärungen, ohne Anführungszeichen, ohne Präambel.';

    return await callLLM({
        provider: llm.provider,
        model: llm.model,
        apiKey: llm.apiKey,
        system,
        user: String(text),
    });
};

export default {callLLM, translate, spellcheck};
export {callLLM, translate, spellcheck};
