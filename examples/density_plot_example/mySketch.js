var dfile, diamonds; // load from JSON

var foo; // p5.Plot() object

function preload() {
	dfile = loadStrings('../../support/diamonds.json'); // load the big file
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

	diamonds = JSON.parse(dfile);
	// CONSTRUCTOR:
	foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7 });

  // PLOT COMMAND:
  // DENSITY
  foo.plot({ type: 'density', data: economics, xkey: 'pop', ykey: null, strokeweight: 3, pointdiameter: 5});
}

function draw() {
  background(255);
  foo.redraw();
  //foo.hover(mouseX, mouseY, 'point');
}
