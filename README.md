# p5.js-plot
p5.plot!

## Documentation
### JSONs
```
// to use existing datasets
var diamonds, mpg, seals, economics;

function preload() {
	diamonds = loadJSON("https://raw.githubusercontent.com/IDMNYU/p5.js-plot/master/support/diamonds.json");
	seals = loadJSON("https://raw.githubusercontent.com/IDMNYU/p5.js-plot/master/support/seals.json");
	mpg = loadJSON("https://raw.githubusercontent.com/IDMNYU/p5.js-plot/master/support/mpg.json");
	economics = loadJSON("https://raw.githubusercontent.com/IDMNYU/p5.js-plot/master/support/economics.json");
}
```
### Getting Started
```
// initiate a variable
let foo;
function setup(){
  // create a new p5.plot instance and store it in the variable
  foo = new p5.Plot();
}
```
The p5.plot object instance takes in the following constructors:
- data

Takes in an array of objects
- xkey

Specify the key value for x axis.
- ykey

Specify the key value for y axis.
- type

Supports "line", "point", "area", "density", "box", "histogram", "pie"
- left

The left position of the graph. Takes a number.
- top

The top position of the graph. Takes a number.
- right

The right position of the graph. Takes a number.
- bottom

The bottom position of the graph. Takes a number.
- background

Whether to draw background. Takes ```true``` or ```false```.
- backgroundcolor
- gridcolor
- gridweight
- cols

The number of columns of the grid.
- rows

The number of the rows of the grid.
- fillcolor

The filling color of the graph.
- strokecolor
- strokeweight
- pointdiameter

The numeric value of the diameter of the points on the graph.
- bins

Number of bins to group the datasets.



### Types of Graphs
- Line graph

{type: 'line'}

- Point graph

{type: 'point'}

- Area graph

{type: 'area'}

- Density graph, one contineous variable

{type: 'density'}

- box and whisker plot

{type: 'box'}

- Histogram

{type: 'histogram'}, one contineous variable

- Pie chart

{type: 'pie'}

### Functions
- redraw()

Put this in draw to use the hover function.
Example:
```
foo.redraw()
```
- hover()

Now supports point graph, line graph and histogram.
Example:
```
foo.hover(mouseX, mouseY, 'point');
foo.hover(mouseX, mouseY, 'bin');
```
