let myData = [{letter:'a'},{letter:'a'},{letter:'a'},{letter:'a'},{letter:'b'},{letter:'b'},{letter:'c'},{letter:'c'},{letter:'c'}];

let foo;
let myPlot;


function setup(){
  createCanvas(800, 400);

  background(255, 0, 0);
  //console.log(myData);

  foo = new p5.Plot({data: myData, fillcolor: [180, 50, 50, 1], type: ['bar1'], xkey: 'letter', width: 500, height: 250});
  myPlot = foo.plot();
}

function draw() {
  background(200);
  text(frameRate().toFixed(2), width-50, 50);
  foo.draw(0, 0, width, height);

}
