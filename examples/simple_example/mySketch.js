let earthquakes;
let myData = [];
let foo;

function preload(){
  earthquakes = loadJSON('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
}

function setup(){
  for (let i=0; i< earthquakes.features.length; i++){
    let lat = earthquakes.features[i].geometry.coordinates[0];
    let long = earthquakes.features[i].geometry.coordinates[1];
    myData.push({lat, long});
  }
  createCanvas(800, 400);
  background(255);
  // CONSTRUCTOR:
  foo = new p5.Plot();
}

function draw() {
  background(255);
  foo.plot({data: myData, type: ['line', 'point'], xkey: 'lat', ykey: 'long'});
}
