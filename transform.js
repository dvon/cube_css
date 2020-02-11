export class Transform {

  constructor(matrix = [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1]) {
    this.matrix = matrix;
    this.history = [];
  }
  
  get matrixT() {
    let m = [];
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        m.push(this.matrix[j * 4 + i]);
      }
    }
    
    return m;
  }
  
  push() { this.history.push(this.matrix); }
  pop() { this.matrix = this.history.pop(); }
  
  static multiply(a, b) {
    let c = [0,0,0,0,  0,0,0,0,  0,0,0,0,  0,0,0,0];

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        for (let k = 0; k < 4; k++)
          c[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
    
    return c;
  }
  
  multiplyBy(that) {
    this.matrix = Transform.multiply(this.matrix, that.matrix);
  }
  
  transformVertex(v) {
    v.push(1);
    let tv = [0, 0, 0, 0];
    
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        tv[i] += this.matrix[i * 4 + j] * v[j];
    
    return [tv[0] / tv[3], tv[1] / tv[3], tv[2] / tv[3]];
  }

  translate(tx, ty, tz) {
    this.matrix = Transform.multiply(this.matrix,
        [1,0,0,tx,  0,1,0,ty,  0,0,1,tz, 0,0,0,1]);
    return this;
  }
  
  scale(sx, sy, sz) {
    this.matrix = Transform.multiply(this.matrix,
        [sx,0,0,0,  0,sy,0,0,  0,0,sz,0,  0,0,0,1]);
    return this;
  }
 
  rotate(axis, a, pre = false) {
    a *= Math.PI / 180;
    let c = Math.cos(a), s = Math.sin(a);
    let m;
    
    if (axis == "X") {
      m = [1,0,0,0,  0,c,-s,0,  0,s,c,0,  0,0,0,1];
    } else if (axis == "Y") {
      m = [c,0,s,0,  0,1,0,0,  -s,0,c,0,  0,0,0,1];
    } else { // Z by default
      m = [c,-s,0,0,  s,c,0,0,  0,0,1,0,  0,0,0,1];
    }
    
    if (pre)
      this.matrix = Transform.multiply(m, this.matrix);
    else
      this.matrix = Transform.multiply(this.matrix, m);
    
    return this;
  }
  
  preRotate(axis, a) {
    this.rotate(axis, a, true);
  }
 
  rotateX(a) { return this.rotate("X", a); }
  rotateY(a) { return this.rotate("Y", a); }
  rotateZ(a) { return this.rotate("Z", a); }
  
  preRotateX(a) { return this.rotate("X", a, true); }
  preRotateY(a) { return this.rotate("Y", a, true); }
  preRotateZ(a) { return this.rotate("Z", a, true); }
}
