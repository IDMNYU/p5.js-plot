var dfile, diamonds; // load from JSON

var foo; // p5.Plot() object

function preload() {
	dfile = loadStrings('diamonds.json'); // load the big file
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(128);

	diamonds = JSON.parse(dfile);

	noLoop();
}

function draw() {
	// mix and match:
	
	// CONSTRUCTOR:
	foo = new p5.Plot(); // easy
	//foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7 });
	//foo = new p5.Plot({ left: 100, top: 100, right: 400, bottom: 200, backgroundcolor: 'lightBlue' });

	// PLOT COMMAND:
	//foo.plot({ data: mpg, xkey: 'year', ykey: 'displ' });
	foo.plot({ type: 'line', data: economics, xkey: 'pop', ykey: 'unemploy', strokeweight: 5 });
	//foo.plot({ type: 'point', data: diamonds, xkey: 'carat', ykey: 'price', strokecolor: [255, 0, 0, 32], fillcolor: [128, 128, 255, 32] });

}