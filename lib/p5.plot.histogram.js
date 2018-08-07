
p5.Plot.prototype.drawHistogram = function(){

  let range;
  let min;
  let max;
  let key;
  let bars;

  if (this.xkey != 0){
    range = this._xmax - this._xmin;
    max = this._xmax;
    min = this._xmin;
    key = this.xkey;
    bars  = this.cols;
  }
  else if (this.ykey != 1){
    range = this._ymax - this._ymin;
    max = this._ymax;
    min = this._ymin;
    key = this.ykey;
    bars = this.rows;
  }
  while (range % bars != 0){
    range += 1;
  }
  let barRange = range / bars;
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

  let x;
  let y;
  let w;
  let h;
  let spacing

  if (key == this.xkey){
    x = this.left;
    y= 0;
    w= this.left;
    h= 0;
    spacing = (this.right - this.left)/(this.cols);

  }
  else if (key == this.ykey){
    x = this.left;
    y = this.top;
    w = 0;
    h = this.top;
    spacing = (this.top - this.bottom)/this.rows;
  }

  rectMode(CORNERS);

  for(let k=0; k < keyObj.length; k++)
  {
    if (key == this.xkey){
      y = map(keyObj[k].quantity, 0, qmax, this.bottom, this.top);
      w += spacing;
      h = this.bottom;
      rect(x, y, w, h)
      x += spacing;

    }
    else if (key == this.ykey){
      h -= spacing;
      w = map(keyObj[k].quantity, 0, qmax, this.left, this.right)
      rect(x, y, w, h)
      y-= spacing;
    }
  }


  pop();

}

p5.Plot.prototype.findKeys = function(barRange, min, max){
  let keyArr = [];
  let mult = 0;
  while ((mult * barRange) < min){
    mult += 1;
  }
  mult -=1;
  for (i = 0; i < this.cols; i++){
    keyArr.push(mult);
    mult += 1;
  }
  return keyArr;
}

p5.Plot.prototype.histParse = function(keyArr, key, barRange){
  keyObj = [{"key": (keyArr[0]* barRange) + "-" + ((keyArr[0] + 1) * barRange), "quantity": 0}];

  for(let j=1; j<keyArr.length; j++){
    keyObj.push({"key": (keyArr[j]* barRange) + "-" + ((keyArr[j] + 1) * barRange), "quantity": 0})
  }

  for(let k=0; k<this.data.length; k++){
    let num = this.data[k][key];
    for (let i = 0; i < keyArr.length; i++){
      if (num >= keyArr[keyArr.length - 1] * barRange){
        keyObj[keyArr.length - 1].quantity += 1;
      }
      else if (num >= keyArr[i] * barRange && num <  keyArr[i + 1] * barRange){
        keyObj[i].quantity += 1
      }
    }
  }
  return keyObj;
}
