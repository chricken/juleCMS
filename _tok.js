const fs = require('fs');
const jwt = require('jsonwebtoken');
const creds = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
const days = (settings.loginValidityDays || 3);
const payload = {v: creds.tokenVersion || 1, lastLogin: Date.now()};
const token = jwt.sign(payload, creds.jwtSecret, {expiresIn: days + 'd'});
fs.writeFileSync('/tmp/token.txt', token);
console.log('token written, len', token.length);
