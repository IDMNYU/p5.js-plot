var dfile, diamonds; // load from JSON

var foo; // p5.Plot() object

var mylook = {strokecolor: [255, 0, 255], fillcolor: [0, 255, 0], background: false};
var crazygrid = {rows: 50, cols: 50, backgroundcolor: 'Black', gridcolor: 'White'};

var lukecrap = [{stuff: 50, things: 20}, {stuff: 55, things: 33}, {stuff: 33, things: 45}];

function preload() {
	dfile = loadStrings('diamonds.json'); // load the big file
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

	diamonds = JSON.parse(dfile);

	noLoop();
}

function draw() {
	// mix and match:

	// CONSTRUCTOR:
	//foo = new p5.Plot(); // easy
		foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7 });
	//foo = new p5.Plot({ left: 100, top: 100, right: 400, bottom: 200, backgroundcolor: 'lightBlue' });

	// PLOT COMMAND:
	//foo.plot({type: 'point', data: lukecrap, xkey: 'stuff', ykey: 'things'});
	//foo.plot({ data: mpg, xkey: 'year', ykey: 'displ' });
	foo.plot({ type: 'line', data: economics, xkey: 'pop', ykey: 'unemploy', strokeweight: 5 });
	//foo.plot({ type: 'line', data: economics, xkey: 'pop', ykey: 'unemploy', strokeweight: 5 }, mylook); // custom look
	//foo.plot({ type: 'point', data: diamonds, xkey: 'carat', ykey: 'price', strokecolor: [255, 0, 0, 32], fillcolor: [128, 128, 255, 32] });
	//foo.plot({ type: 'point', data: diamonds, xkey: 'carat', ykey: 'price', strokecolor: [255, 0, 0, 32], fillcolor: [128, 128, 255, 32] }, crazygrid);

}
