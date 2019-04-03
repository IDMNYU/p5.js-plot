var foo; // p5.Plot() object

var barData = [{"x":"a", "y":10}, {"x":"b", "y":16}, {"x":"c", "y":5}];
var barData2 = [{"x":"a"}, {"x":"b"}, {"x":"c"}, {"x":"a"}, {"x":"a"}, {"x":"b"}];

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

	// CONSTRUCTOR:
	foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7});

	foo.plot({ type: 'bar', data: barData, xkey: "x", ykey: "y", strokeweight: 2});
	//foo.plot({ type: 'bar', data: barData2, xkey: "x", ykey: "XSUM", strokeweight: 2});
  //foo.plot({ type: 'box', data: mpg, xkey: 'year', ykey: 'displ', strokeweight: 2});
	//foo.plot({ type: 'box', data: boxData, xkey: 'y', ykey: 'x', strokeweight: 2});

}

function draw() {
  background(255);
  foo.redraw();
}
