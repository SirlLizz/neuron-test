const brain = require('../node_modules/brain.js/lib/brain');
let network = new brain.NeuralNetwork();
const fs = require('fs');
const mn = require('mnist-javascript')
const mnist = new mn;
let counter = 0
while (mnist.hasBatch()) {
    let batch = mnist.nextBatch();
    network.train(batch)
    console.log(counter)
    counter++
}

network.test(mnist.testSamples);

let wstream = fs.createWriteStream('./data/mnistTrain2.json');
wstream.write(JSON.stringify(network.toJSON(),null,2));
wstream.end();

console.log('Yahooo')


