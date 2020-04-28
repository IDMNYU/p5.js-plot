// test box plot
// discrete x, continues y

//let myData = [{"fruit":"apple", "num":13}, {"fruit":"apple", "num":16}, {"fruit":"apple", "num":57}, {"fruit":"apple", "num":34}, {"fruit":"apple", "num":26}, {"fruit":"apple", "num":67}, {"fruit":"apple", "num":12}, {"fruit":"banana", "num":45}, {"fruit":"banana", "num":32}, {"fruit":"banana", "num":24}, {"fruit":"banana", "num":86}, {"fruit":"banana", "num":65}, {"fruit":"banana", "num":37}, {"fruit":"banana", "num":98}];

// just a set of numbers
let myData = [13, 16, 57, 87, 92, 10, 120, 30, 72, 101];

let foo;
let myPlot;


function setup(){
  createCanvas(800, 400);

  background(255, 0, 0);
  //console.log(myData);

  //foo = new p5.Plot({data: myData, xkey: 'fruit', ykey: 'num', strokecolor: [180, 50, 50, 200], type: ['box'], width: 500, height: 250});
  foo = new p5.Plot({data: myData, strokecolor: [180, 50, 50, 200], type: ['box'], width: 500, height: 250});
  myPlot = foo.plot();
}

function draw() {
  background(200);
  text(frameRate().toFixed(2), width-50, 50);
  foo.draw(0, 0, width, height);
}
