
p5.Plot.prototype.drawBarGraph = function()
{
  //let xkey = this.xkey;
  //let ykey = this.ykey;
  let key;
  let max;
  let keyArr;
  let keyObj;
  let spacing

  this._ymin = 0;
  this._xmin = 0;

  if (this.xkey != 0){
    keyArr = this.barSort(this.xkey);
    key = this.xkey;
    keyObj = this.barParse(key);
    spacing = (this.right - this.left)/keyArr.length;
  }
  else if (this.ykey != 1){
    keyArr = this.barSort(this.ykey);
    key = this.ykey;
    keyObj = this.barParse(key);
    spacing = (this.bottom - this.top)/keyArr.length
  }

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);
  max = keyObj[0].quantity;

  for(let i in keyObj){
    if(keyObj[i].quantity > max){max = keyObj[i].quantity;}
  }

  if (key == this.xkey){
    this._xmax = keyArr.length;
    this._ymax = max;
  }
  else if (key == this.ykey){
    this._xmax = max;
    this._ymax = keyArr.length;
  }


  push();
  let x;
  let y;
  let w;
  let h;

  if (key == this.xkey){
    x = this.left;
    y= 0;
    w= this.left;
    h= 0;
  }
  else if (key == this.ykey){
    x = this.left;
    y = this.top;
    w = 0;
    h = this.top;
  }

  rectMode(CORNERS);

  for(let k=0; k < keyObj.length; k++)
  {
    if (key == this.xkey){
      y = map(keyObj[k].quantity, 0, this._ymax, this.bottom, this.top);
      w += spacing;
      h = this.bottom;
      rect(x, y, w, h)
      x += spacing;
    }
    else if (key == this.ykey){
      h += spacing;
      w = map(keyObj[k].quantity, 0, max, this.left, this.right)
      rect(x, y, w, h)
      y+= spacing;
    }
  }

  pop();
}

p5.Plot.prototype.barSort = function(_key){
  keyArr = [this.data[0][_key]];
  this.data[0][_key] = 0;

  for(let i=1;i<this.data.length;i++){
    let index = keyArr.indexOf(this.data[i][_key])
    if(index == -1){
      keyArr.push(this.data[i][_key])
      this.data[i][_key] = keyArr.length - 1;
    }
    else if (index != -1){
      this.data[i][_key] = index;
    }
  }
  return keyArr;
}

p5.Plot.prototype.barParse = function(key){
  keyObj = [{"key": keyArr[0], "quantity": 0}];

  for(let j=1; j<keyArr.length; j++){
    keyObj.push({"key": keyArr[j], "quantity": 0})
  }

  for(let k=0; k<this.data.length; k++){
    let search = this.data[k][key];
    keyObj[search].quantity += 1;
  }
  return keyObj;
}
