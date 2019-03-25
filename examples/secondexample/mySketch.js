var dfile, diamonds; // load from JSON

var foo; // p5.Plot() object

function preload() {
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

	// CONSTRUCTOR:
	//foo = new p5.Plot(); // easy
	foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7 });
	//foo = new p5.Plot({ left: 100, top: 100, right: 400, bottom: 200, backgroundcolor: 'lightBlue' });

  background(255);
  //foo.plot({ type: 'point', data: mpg, xkey: 'cty', ykey: 'hwy', strokecolor: [255, 0, 0, 32], fillcolor: [128, 128, 255, 32] });


  // AREA
  //foo.plot({ type: 'area', data: economics, xkey: 'pop', ykey: 'unemploy', strokeweight: 5 }, stylelist[whichstyle]); // custom look

  // HISTOGRAM
  foo.plot({ type: 'histogram', data: mpg, xkey: 'trans', strokeweight: 5});

  // PIE
  //foo.plot({type: 'pie', data: pieData, xkey:'x', background: false});

  // not yet.....................................................................
  // BOX
	//foo.plot({ type: 'box', data: economics, xkey: 'pop', strokeweight: 5});
  //foo.plot({ type: 'box', data: mpg, xkey: 'displ', ykey: 'year', strokeweight: 5});
  //foo.plot({ type: 'box', data: diamonds, xkey: 'price', ykey: 'clarity', strokeweight: 1});
	//foo.plot({ type: 'box', data: boxData, xkey: 'x', ykey: 'y', strokeweight: 5});

  // DENSITY
  //foo.plot({ type: 'density', data: economics, xkey: 'pop', strokeweight: 5});



}

function draw() {
  background(255);
  foo.redraw();
  foo.hover(mouseX, mouseY, 'point');
  //foo.hover(mouseX, mouseY, 'bin');
}

function keyPressed() {
  whichstyle = (whichstyle+1)%stylelist.length;
  foo.plot(stylelist[whichstyle]);

}
