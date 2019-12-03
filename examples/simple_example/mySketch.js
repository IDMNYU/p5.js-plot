let earthquakes;
let myData = [];
let foo;
let x = -100;
let y = 100;

let myPlot;

function preload(){
  earthquakes = loadJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');

}

function setup(){
  createCanvas(800, 400);
  background(255);
  for (let i=0; i< earthquakes.features.length; i++){
    let lat = earthquakes.features[i].geometry.coordinates[0];
    let long = earthquakes.features[i].geometry.coordinates[1];
    myData.push({lat, long});
  }
  //console.log(myData);

  // CONSTRUCTOR:
  foo = new p5.Plot({data: myData, type: ['point', 'line'], xkey: 'lat', ykey: 'long'});
  myPlot = foo.plot();
  console.log(myPlot.width + ' '+myPlot.height);
}

function draw() {
  //background(random()*255, random()*255, random()*255);
  background(200);
  text(frameRate().toFixed(2), width-50, 50);
  x-=10;
  y+=10;

  image(myPlot, 0, 0, myPlot.width, myPlot.height);

  //myData.push({lat:x,long:y});

  //mydiv.position(mouseX, mouseY);
  //console.log(foo.plotData);
}

function keyTyped() {
  myData.push({lat:random(foo._xmin, foo._xmax),long:random(foo._ymin, foo._ymax)});
  foo.data = myData;
}
