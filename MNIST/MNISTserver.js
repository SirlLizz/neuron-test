let brain = require('../node_modules/brain.js/lib/brain'),
    net = new brain.NeuralNetwork()

net.fromJSON(require('../.data/mnistTrain.json'));

function numerical_check(input){
    let output = net.run(input);
    let maximum = output.reduce(function(p,c) { return p>c ? p : c; });
    let nominators = output.map(function(e) { return Math.exp(e - maximum); });
    let denominator = nominators.reduce(function (p, c) { return p + c; });
    let softmax = nominators.map(function(e) { return e / denominator; });

    let maxIndex = 0;
    softmax.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
    return maxIndex.toString()
}

module.exports =  { numerical_check };