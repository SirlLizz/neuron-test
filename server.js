let express = require('express');
let http = require('http');
let path = require('path');
let app = express();
let server = http.Server(app);
let MNISTserver =  require("./MNIST/MNISTserver")
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
    extended: false,
})

let port = 6431

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public/'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/mnist-neuron', function(request, response) {
    response.sendFile(path.join(__dirname, '/public/mnist-neuron.html'));
});

app.get('/genetic-algorithm', function(request, response) {
    response.sendFile(path.join(__dirname, '/public/genetic-algorithm.html'));
});

server.listen(port, function() {
    console.log('Run server by port ' + port);
});

app.post('/check_data', urlencodedParser, function (
    request,
    response
) {
    if (!request.body) return response.sendStatus(400)
    response.send(MNISTserver.numerical_check(JSON.parse(request.body.nnInput2)))
})

module.exports = app;