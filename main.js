const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
const N = 500;
const cars=generateCars(N)
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}



const traffic= createTraffic();
function createTraffic(){
    const traffic = [];
    for(let i=0;i<500;i++){
        traffic.push(new Car(road.getLaneCenter(Math.map()),100,30,50,"DUMMY",2,getRandomColor()));
    }
    return traffic;
}


animate();

function save(){
    localStorage.setItem("bestBrain",JSON.stringify(bestCar.brain));
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);

}

function discard(){
    localStorage.removeItem("bestBrain");
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}


function generateCars(N){
    const cars = [];
    for(let i=0;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
        for(let j=0;j<road.laneCount;j++){
            if(cars[i].x==road.getLaneCenter(j)){
                cars[i].centered = true;
            }
        }
    }

    bestCar = cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y))
    );

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }

    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx, true);
    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
