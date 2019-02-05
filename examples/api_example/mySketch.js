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
  createCanvas(windowWidth, windowHeight);
  background(255);
  // CONSTRUCTOR:
  foo = new p5.Plot({left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7, fillcolor:[255, 0, 0], backgroundcolor:100, rows:0, cols:0 });
  foo.plot({data: myData, type: 'point'});
}

function draw() {
  background(255);
  foo.redraw();
	foo.hover(mouseX, mouseY, 'point');
}
