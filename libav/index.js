var minimst = require('minimist');
// import Session from './session';
var Session = require('./session');
// import Register from './register';
var Register = require('./register');

const argvConf = minimst(process.argv.slice(2), {
    default: {
        as_uri : 'https://172.16.2.24:5000',
        // ws_uri : "wss://172.16.3.11:8433/kurento"
        // ws_uri : "wss://172.16.0.73:8433/kurento"
        ws_uri: 'wss://27.147.195.221:8433/kurento'
        // ws_uri: 'wss://209.59.180.75:8433/kurento'
        // ws_uri: 'ws://172.16.3.11:8888/kurento'
    }
});

module.exports = {
    Register,
    Session,
    argvConf
}