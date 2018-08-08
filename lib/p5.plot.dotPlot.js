p5.Plot.prototype.drawDotPlot = function(){

  let range = this._xmax - this._xmin;
  let max = this._xmax;
  let min = this._xmin;
  let key = this.xkey;
  let xDots  = this.cols - 1;
  let yDots = this.rows - 1;

  while (range % xDots != 0){
    range += 1;
  }

  let barRange = range / xDots;
  let keyArr = this.findKeys(barRange, min,max);
  let keyObj = this.histParse(keyArr, key, barRange);

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  let qmax = keyObj[0].quantity;

  for(let i in keyObj){
    if(keyObj[i].quantity > qmax){qmax = keyObj[i].quantity;}
  }

  console.log(keyObj);

  push();

  let xone = (this.right - this.left) / xDots;
  let xhalf = xone / 2;
  let yone = (this.top - this.bottom)/yDots
  let yhalf = yone / 2


  let x = this.left + xhalf;
  let y = this.bottom + yhalf;
  let w;

  if (yone <= xone){w = yone;}
  else{w = xone;}

  ellipseMode(CENTER);


  for(let k=0; k < keyObj.length; k++) {
    let dotNum = keyObj[k].quantity / yDots;
    for(let j = 0; j < dotNum; j++){
      ellipse(x, y, w);
      y += yone;
    }
    x += xone;
    y = this.bottom + yhalf;

  }
  pop();

}
