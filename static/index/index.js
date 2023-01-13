window.onload = function () {
    document.getElementById("mnistButton").addEventListener("click", function () {
        window.location.href = '/mnist-neuron'
    });

    document.getElementById("geneticAlgorithmButton").addEventListener("click", function() {
        window.location.href = '/genetic-algorithm'
    });
}

