let foo; // p5.Plot() object
let minBinNum = 2;
let maxBinNum = 30;
let binNum = 2;
let slider;

function setup(){
	createCanvas(windowWidth, windowHeight);
  slider = createSlider(minBinNum, maxBinNum, 1);
  slider.position(100, 100);
  slider.style('width', '80px');
  slider.changed(changeBin);
	background(255);

	// CONSTRUCTOR:
	foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7 });

  // PLOT COMMAND:
  // HISTOGRAM
  foo.plot({ type: 'histogram', data: economics, xkey: 'pop', strokeweight: 5, bins: binNum});
}

function draw() {
  background(255);
  text('current bin number: '+ binNum, 100, 80)
  foo.redraw();
  foo.hover(mouseX, mouseY, 'bin');
}

function changeBin(){
  binNum = slider.value();
  foo.plot({bins: binNum});
}
