const express = require('express');
const app = express();
var nunjucks = require('nunjucks');

app.set('view engine', 'html');
app.engine('html',nunjucks.render);
nunjucks.configure('views', {noCache: true});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('hello')
})

app.get('/emea', (req, res) => {
    res.render('emea')
})
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})