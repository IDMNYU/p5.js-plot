var foo; // p5.Plot() object

var boxData = [{"x":13, "y":"a"}, {"x":16, "y":"a"}, {"x":57, "y":"a"}, {"x":34, "y":"a"}, {"x":26, "y":"a"}, {"x":67, "y":"a"}, {"x":12, "y":"a"},
 {"x":45, "y":"b"}, {"x":32, "y":"b"}, {"x":24, "y":"b"}, {"x":86, "y":"b"}, {"x":65, "y":"b"}, {"x":37, "y":"b"}, {"x":98, "y":"b"}];

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

	// CONSTRUCTOR:
	foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7, background: false});

	foo.plot({ type: 'box', data: economics, xkey: null, ykey: 'pop', strokeweight: 2});
  //foo.plot({ type: 'box', data: mpg, xkey: 'year', ykey: 'displ', strokeweight: 2});
	//foo.plot({ type: 'box', data: boxData, xkey: 'y', ykey: 'x', strokeweight: 2});

}

function draw() {
  background(255);
  foo.redraw();
}
