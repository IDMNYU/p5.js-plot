let earthquakes;
let myData = [];
let foo;
let x = -100;
let y = 100;

function preload(){
  earthquakes = loadJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
}

function setup(){
  for (let i=0; i< earthquakes.features.length; i++){
    let lat = earthquakes.features[i].geometry.coordinates[0];
    let long = earthquakes.features[i].geometry.coordinates[1];
    myData.push({lat, long});
  }
  //console.log(myData);
  createCanvas(800, 400);
  background(255);
  // CONSTRUCTOR:
  foo = new p5.Plot({data: myData, type: ['line', 'point'], xkey: 'lat', ykey: 'long'});

}

function draw() {
  background(random()*255, random()*255, random()*255);
  text(frameRate().toFixed(2), width-50, 50);
  x-=10;
  y+=10;
  //myData.push({lat:x,long:y});
  foo.plot();
  //console.log(foo.plotData);
}

function keyTyped() {
  myData.push({lat:random(foo._xmin, foo._xmax),long:random(foo._ymin, foo._ymax)});
  foo.data = myData;
}
