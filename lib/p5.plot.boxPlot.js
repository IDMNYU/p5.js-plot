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

  // here lets assume xkey is contineous and
  // ykey is discrete
  // draw horizontal graphs
  // the number of ykey represent number of boxes
  let xkey = this.xkey;
  let ykey = this.ykey;

  // if x is contineous, find min & max
  let xmin = this._xmin;
  let xmax = this._xmax;

  push();

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // if there's more than one set of continuous data
  // put every unique y value into the array
  let boxArr = [];
  let valueMin = xmin; //if given y value, this is useful
  let valueMax = xmax;

  // check in our data, how many unique y & push them into new array
  // if no ykey is given, y would just be default 1, apparently
  for(let i in this.data){
    if (boxArr.includes(this.data[i][ykey])){
    }
    else{
      boxArr.push(this.data[i][ykey]);
    }
  }

  let numBox = boxArr.length;
  let boxMargin = ((this.bottom-this.top)/numBox)/10;
  let boxY = this.top+boxMargin;
  let boxHeight = (this.bottom-this.top)/numBox - boxMargin*2;

  // for every box array value, draw a box
  for (let j=0; j<numBox; j++){
    let valueArr = [];
    for (let k in this.data){
      if (this.data[k][ykey] === boxArr[j])
       valueArr.push(this.data[k][xkey]);
       // check the value, if it's higher or lower than the min & max value
       if (this.data[k][xkey]<valueMin){
         valueMin = this.data[k][xkey]
       }
       else if (this.data[k][xkey]>valueMax){
         valueMax = this.data[k][xkey]
       }
    }

    let xQuartileBoundsArr = quartileBounds(valueArr);
    // map minimum, first quartile, median, third quartile, and maximum into the graph
    // two graphs should have a common scale instead of their own scale
    let boxMin = map(xQuartileBoundsArr[0], valueMin, valueMax, this.left, this.right);
    let boxQ1 = map(xQuartileBoundsArr[1], valueMin, valueMax, this.left, this.right);
    let boxMedian = map(xQuartileBoundsArr[2], valueMin, valueMax, this.left, this.right);
    let boxQ3 = map(xQuartileBoundsArr[3], valueMin, valueMax, this.left, this.right);
    let boxMax = map(xQuartileBoundsArr[4], valueMin, valueMax, this.left, this.right);

    console.log(boxMin+' '+boxQ1+' '+boxMedian+' '+boxQ3+' '+ boxMax);

    // graph multiple horizontal box plots after dealing with data

    // the height of box, keep it constant
    //let boxHeight = this.bottom-this.top;

    drawOneBox(boxMin, boxQ1, boxMedian, boxQ3, boxMax, boxY, boxHeight);

    //draw next box, the Y pos will increase!
    boxY += boxMargin + boxHeight;
    }
  pop();
}

// find the median
// if array is odd number, median is middle number
// if array is even number, median is middle two numbers added then divide by two
function getMedian(sampleArr){
  sampleArr.sort(function(a, b){return a - b});
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
  // must sort array first
  sampleArr.sort(function(a, b){return a - b});
  let _firstHalf;
  let _secondHalf;
  // even
  if (sampleArr.length%2 === 0){
    _firstHalf = sampleArr.slice(0, sampleArr.length/2);
    _secondHalf = sampleArr.slice(sampleArr.length/2, sampleArr.length);
  }
  // odd
  else {
    _firstHalf = sampleArr.slice(0, (sampleArr.length-1)/2);
    _secondHalf = sampleArr.slice(((sampleArr.length-1)/2)+1, sampleArr.length);
  }
  let _0percent = min(sampleArr);

  // find the medians for each split
  let _25percent = getMedian(_firstHalf);
  let _75percent = getMedian(_secondHalf);

  let _50percent = getMedian(sampleArr);
  let _100percent = max(sampleArr);

  return [ _0percent, _25percent, _50percent, _75percent, _100percent];
}

function drawOneBox(boxMin, boxQ1, boxMed, boxQ3, boxMax, boxY, boxHeight){
  line(boxMin, boxY+boxHeight/4, boxMin, boxY+boxHeight/4+boxHeight/2); // minimum

  line(boxQ1, boxY, boxQ1, boxY+boxHeight); // Q1

  line(boxMed, boxY, boxMed, boxY+boxHeight); // median

  line(boxQ3, boxY, boxQ3, boxY+boxHeight); // Q3

  line(boxMax, boxY+boxHeight/4, boxMax, boxY+boxHeight/4+boxHeight/2); //maximum

  // connect
  line(boxQ1, boxY, boxQ3, boxY); // top of box
  line(boxQ1, boxY+boxHeight, boxQ3, boxY+boxHeight); // bot of box
  line(boxMin, boxY+boxHeight/2, boxQ1, boxY+boxHeight/2);
  line(boxQ3, boxY+boxHeight/2, boxMax, boxY+boxHeight/2);
}
