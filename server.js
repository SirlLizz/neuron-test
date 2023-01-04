let express = require('express');
let http = require('http');
let path = require('path');
let app = express();
let server = http.Server(app);
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({
    extended: false,
})
let brain = require('brain.js'),
    net = new brain.NeuralNetwork()

net.fromJSON(require('./.data/mnistTrain.json'));

let port = 6431

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public/'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, function() {
    console.log('Run server by port ' + port);
});

app.post('/check_data', urlencodedParser, function (
    request,
    response
) {
    if (!request.body) return response.sendStatus(400)
    let output = net.run(JSON.parse(request.body.nnInput2));
    let maximum = output.reduce(function(p,c) { return p>c ? p : c; });
    let nominators = output.map(function(e) { return Math.exp(e - maximum); });
    let denominator = nominators.reduce(function (p, c) { return p + c; });
    let softmax = nominators.map(function(e) { return e / denominator; });

    let maxIndex = 0;
    softmax.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});

    let result = [];

    for (let i=0; i<output.length; i++)
    {
        if (i===maxIndex)
            result.push(1);
        else
            result.push(0);
    }
    maxIndex = 0;
    result.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
    response.send(maxIndex.toString())
})

module.exports = app;