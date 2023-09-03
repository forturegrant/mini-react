const express = require('express');
const path = require('path');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');

const app = express();

// 并不是直接就可以去拿到对应的dom片段，这个dom片段还是要让webpack打包一下的
// const ServerApp = require('../client/ServerApp').default;
const ServerApp = require('../../dist/ServerApp').default;

const Appstring = ReactDOMServer.renderToString(ServerApp);
console.log(ServerApp, 'ServerApp');
console.log(Appstring, 'Appstring');

const htmlTemplate = fs.readFileSync(path.join(__dirname, '../../dist/index.html'), { encoding: 'utf8' });
console.log(htmlTemplate, 'htmlTemplate');
const newHtml = htmlTemplate.replace('<!-- app -->', Appstring);
console.log(newHtml, 'newHtml');

app.use('/', express.static(path.join(__dirname, '../../dist')));
// app.use('/public', express.static(path.join(__dirname, '../../dist')));

app.get('/', (req, res) => {
    res.send(newHtml);
})

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('server on port'));
