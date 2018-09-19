p5.Plot.prototype.drawBoxPlot = function()
{
  // draw box plot
  // graph minimum, first quartile, median, third quartile, and maximum

  // only makes sense when there's discrete y and continuous x or;
  // discrete x and continuous y
  // for example:
  /* boxData = [{"x":13, "y":"a"}, {"x":16, "y":"a"}, {"x":57, "y":"a"}, {"x":34, "y":"a"}, {"x":26, "y":"a"}, {"x":67, "y":"a"}, {"x":12, "y":"a"},
   {"x":45, "y":"b"}, {"x":32, "y":"b"}, {"x":24, "y":"b"}, {"x":86, "y":"b"}, {"x":65, "y":"b"}, {"x":37, "y":"b"}, {"x":98, "y":"b"}];
  */

  // ???????????????????
  // here lets assume xkey is contineous and
  // ykey is discrete
  // the number of ykey represent number of boxes
  let xkey = this.xkey;
  let ykey = this.ykey;

  let xmin = this._xmin;
  let xmax = this._xmax;

  push();

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // if there's more than one set of continuous data
  // put every unique y value into the array
  let boxArr = [];
  if (ykey){
    for(let i in this.data){
      if (boxArr.includes(this.data[i][ykey])){
      }
      else{
        boxArr.push(this.data[i][ykey]);
      }
    }
    let numBox = boxArr.length;
    // for every box array value, draw a box
    for (let j=0; j<numBox; j++){
      let valueArr = [];
      for (let k in this.data){
        if (this.data[k][ykey] === boxArr[j])
         valueArr.push(this.data[k][xkey]);
      }
      let xQuartileBoundsArr = quartileBounds(valueArr);
      // map minimum, first quartile, median, third quartile, and maximum into the graph
      let xTop = map(xQuartileBoundsArr[0], xmin, xmax, this.left, this.right);
      let xQ1 = map(xQuartileBoundsArr[1], xmin, xmax, this.left, this.right);
      let xMedian = map(xQuartileBoundsArr[2], xmin, xmax, this.left, this.right);
      let xQ3 = map(xQuartileBoundsArr[3], xmin, xmax, this.left, this.right);
      let xBot = map(xQuartileBoundsArr[4], xmin, xmax, this.left, this.right);

      // graph multiple horizontal box plots after dealing with data
      let graphHeight = (this.bottom-this.top)/(numBox);
      // the height of box, keep it constant
      let boxHeight = graphHeight;

      line(xTop, graphHeight/2+boxHeight/4, xTop, graphHeight/2+boxHeight/4+boxHeight/2); // minimum

      line(xQ1, graphHeight/2, xQ1, graphHeight/2+boxHeight); // Q1

      line(xMedian, graphHeight/2, xMedian, graphHeight/2+boxHeight); // median

      line(xQ3, graphHeight/2, xQ3, graphHeight/2+boxHeight); // Q3

      line(xBot, graphHeight/2+boxHeight/4, xBot, graphHeight/2+boxHeight/4+boxHeight/2); //maximum

      // connect
      line(xQ1, graphHeight/2, xQ3, graphHeight/2); // top of box
      line(xQ1, graphHeight/2+boxHeight, xQ3, graphHeight/2+boxHeight); // bot of box
      line(xTop, boxHeight, xQ1, boxHeight);
      line(xQ3, boxHeight, xBot,boxHeight);

      pop();
    }
  }
  // if ykey isn't given, boxArr.length = 0, draw only one box
  else{
    // this is drawing ONE box horizontally
    let valueArr = [];
    // push all the values into an array
    for(let k in this.data){
       valueArr.push(this.data[k][xkey]);
    }

    let xQuartileBoundsArr = quartileBounds(valueArr);

    // map minimum, first quartile, median, third quartile, and maximum into the graph
    let xTop = map(xQuartileBoundsArr[0], xmin, xmax, this.left, this.right);
    let xQ1 = map(xQuartileBoundsArr[1], xmin, xmax, this.left, this.right);
    let xMedian = map(xQuartileBoundsArr[2], xmin, xmax, this.left, this.right);
    let xQ3 = map(xQuartileBoundsArr[3], xmin, xmax, this.left, this.right);
    let xBot = map(xQuartileBoundsArr[4], xmin, xmax, this.left, this.right);

    // graph box plot after dealing with data
    drawBox(xTop, xQ1, xMedian, xQ3, xBot);

    pop();
  }
  function drawBox(xTop, xQ1, xMedian, xQ3, xBot){
    let graphHeight = this.bottom-this.top;

    // the height of box, keep it constant
    let boxHeight = graphHeight;

    line(xTop, graphHeight/2+boxHeight/4, xTop, graphHeight/2+boxHeight/4+boxHeight/2); // minimum

    line(xQ1, graphHeight/2, xQ1, graphHeight/2+boxHeight); // Q1

    line(xMedian, graphHeight/2, xMedian, graphHeight/2+boxHeight); // median

    line(xQ3, graphHeight/2, xQ3, graphHeight/2+boxHeight); // Q3

    line(xBot, graphHeight/2+boxHeight/4, xBot, graphHeight/2+boxHeight/4+boxHeight/2); //maximum

    // connect
    line(xQ1, graphHeight/2, xQ3, graphHeight/2); // top of box
    line(xQ1, graphHeight/2+boxHeight, xQ3, graphHeight/2+boxHeight); // bot of box
    line(xTop, boxHeight, xQ1, boxHeight);
    line(xQ3, boxHeight, xBot,boxHeight);
  }
}

// find the median
// if array is odd number, median is middle number
// if array is even number, median is middle two numbers added then divide by two
function median(sampleArr){
  // even
  if (sampleArr.length%2 === 0){
    let numA = sampleArr[sampleArr.length/2 - 1];
    let numB = sampleArr[sampleArr.length/2];
    return (numA + numB)/2;
  }
  // odd
  else{
    return sampleArr[(sampleArr.length - 1)/2];
  }
}

// find medians and quartiles
function quartileBounds(sampleArr){

  let _median = median(sampleArr)

  // split the data by the median
  let _firstHalf = sampleArr.filter(function(f){ return f < _median })
  let _secondHalf = sampleArr.filter(function(f){ return f >= _median })

  let _0percent = min(sampleArr);

  // find the medians for each split
  let _25percent = median(_firstHalf);
  let _75percent = median(_secondHalf);

  let _50percent = _median;
  let _100percent = max(sampleArr);

  return [ _0percent, _25percent, _50percent, _75percent, _100percent];
}
