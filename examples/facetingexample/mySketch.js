var survey = [];

var foo; // p5.Plot() object

var bar = [{x: 50}, {x: 75}, {x: 33}];

var a = 0.1;

function preload() {
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);

	// make a fake survey
	for(let i = 0;i<50;i++)
	{
		var yikes = {};
		yikes.q1 = floor(random(6));
		yikes.q2 = floor(random(6));
		yikes.q3 = floor(random(6));
		yikes.q4 = floor(random(6));
		yikes.q5 = floor(random(6));

		survey.push(yikes);
	}

	console.log(survey);
	// CONSTRUCTOR:
	//foo = new p5.Plot(); // easy
	foo = new p5.Plot({ left: width*0.2, top: height*0.3, right: width*0.8, bottom: height*0.7 });
	//foo = new p5.Plot({ left: 100, top: 100, right: 400, bottom: 200, backgroundcolor: 'lightBlue' });
	// BAR
  //foo.plot({ barwidth: a, type: 'bar2', data: survey, xkey: 'q1', strokeweight: 5});
	foo.plot({ type: 'line', data: survey, xkey: ['q1', 'q2', 'q3', 'q4'], ykey:"q5", strokeweight: 5});
}

function draw() {
  //background(255);


	//a = a+.1;
  foo.hover(mouseX, mouseY, 'point');
  //foo.hover(mouseX, mouseY, 'bin');
}

function keyPressed() {

}
