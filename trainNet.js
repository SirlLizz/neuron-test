const brain = require('brain.js');
let network = new brain.NeuralNetwork();
const fs = require('fs');
const mn = require('mnist-javascript')
const mnist = new mn;
let counter = 0
trainNet()

network.test(mnist.testSamples);

let wstream = fs.createWriteStream('./data/mnistTrain.json');
wstream.write(JSON.stringify(network.toJSON(),null,2));
wstream.end();

console.log('Yahooo')

async function trainNet(){
    while (mnist.hasBatch()) {
        let batch = mnist.nextBatch();
        await network.train(batch);
        counter++
        console.log(counter)
    }
}

