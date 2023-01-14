const A = [0.2, 0.5];
const B = [0.8, 0.5];

window.onload = function () {
    const canvas = document.getElementById("genetic-canvas")
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext("2d");
    let set_interval_id = null

    document.getElementById("backButton").addEventListener("click", function () {
        window.location.href = '/'
    });

    document.getElementById("startButton").addEventListener("click", function () {
        let population = []
        let intermediate_point = parseInt(document.getElementById("intermediate_point").value)
        let population_size = parseInt(document.getElementById("population_size").value)

        let perfect_len = Math.sqrt(Math.pow(B[0]-A[0], 2)+Math.pow(B[1]-A[1], 2))

        while (population.length < population_size) {
            let points = [];
            while (points.length < intermediate_point)
                points.push([Math.random(), Math.random()]);
            population.push({p:points, size: getLength(points)});
        }
        console.log(population)
        render(population)

        set_interval_id = setInterval(function() {
            population.sort(function (a,b) { return a.size - b.size; });
            let maxIndex = Math.ceil(population_size/2);
            for(let i=0;i<maxIndex;i++) {
                population.pop();
            }
            while (population.length < population_size) {
                if (Math.random() < 0.5) {
/*                    //mutation
                    let newMutant = population[Math.floor(Math.random(maxIndex))];
                    for (let k = 0; k < Math.floor(1 + Math.random() * Math.sqrt(intermediate_point)); k++ ) {
                        let mutPosIndex = Math.floor(Math.random() * intermediate_point);
                        let rMut = 0.10 * Math.random();
                        let alphaMut = 2 * Math.PI * Math.random();
                        newMutant.p[mutPosIndex][0] += rMut * Math.sin(alphaMut);
                        newMutant.p[mutPosIndex][1] += rMut * Math.cos(alphaMut);
                    }
                    newMutant.size = getLength(newMutant.p)
                    population.push(newMutant);*/
                } else {
                    //crossover
                    let index1 = Math.floor(Math.random(maxIndex));
                    let index2 = Math.floor(Math.random(maxIndex));
                    let newCrossover = population[index1]
                    let mutPosIndex = Math.floor(Math.random() * intermediate_point);
                    while (mutPosIndex !== (intermediate_point-1)) {
                        console.log(mutPosIndex)
                        mutPosIndex = Math.floor(Math.random() * intermediate_point);
                        newCrossover.p[mutPosIndex][0] = population[index2].p[mutPosIndex][0];
                        newCrossover.p[mutPosIndex][1] = population[index2].p[mutPosIndex][1];
                    }
                    newCrossover.size = getLength(newCrossover.p)
                    population.push(newCrossover);
                }
            }
            console.log(population)
            render(population)
            if(perfect_len === population[0].size){
                clearInterval(set_interval_id)
            }
        }, 600);
    });

    document.getElementById("stopButton").addEventListener("click", function () {
        if(set_interval_id!==null){
            clearInterval(set_interval_id)
        }
    });

    function getLength(points){
        let len = 0
        let now_point = A
        for(let i=0;i<points.length;i++){
            len+=Math.sqrt(Math.pow(now_point[0] - points[i][0], 2) + Math.pow(now_point[1] - points[i][1], 2));
            now_point = points[i]
        }
        len+=Math.sqrt(Math.pow(now_point[0] - B[0], 2) + Math.pow(now_point[1] - B[1], 2));
        return len
    }

    function render(population){
        console.log("print")
        console.log(population)
        ctx.clearRect(0,0, w, h);
        ctx.font = "20px serif";
        ctx.strokeStyle = "black"
        for (let k = 0; k < population.length ; k++) {
            ctx.beginPath();
            if (k === 0) {
                ctx.lineWidth=2;
            } else {
                ctx.lineWidth=0.25;
            }
            ctx.moveTo(A[0] * w, A[1] * h);
            for (let j = 0; j < population[k].p.length; j++) {
                ctx.lineTo(population[k].p[j][0] * w, population[k].p[j][1] * h);
            }
            ctx.lineTo(B[0] * w, B[1] * h);
            ctx.stroke();
        }
        ctx.strokeStyle = "red"
        ctx.fillStyle = "red"
        ctx.beginPath();
        ctx.arc(A[0] * w, A[1] * h, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillText("A", A[0] * w - 6, A[1] * h - 6);
        //point B
        ctx.beginPath();
        ctx.arc(B[0] * w, B[1] * h, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillText("B", B[0] * w - 6, B[1] * h - 6);
        console.log("end print")
    }
}