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
  
  frustum(r, t, n, f) {
    let a = (n + f) / (n - f);
    let b = 2 * n * f / (n - f);
    
    this.matrix = Transform.multiply(this.matrix,
        [n/r,0,0,0,  0,n/t,0,0,  0,0,a,b,  0,0,-1,0]);

    return this;
  }
  
  static invert(transform) {
    let [m00, m01, m02, m03,
         m10, m11, m12, m13,
         m20, m21, m22, m23,
         m30, m31, m32, m33] = transform.matrix;
    
    let i00 =  m11 * m22 * m33  -  m11 * m23 * m32 -
               m21 * m12 * m33  +  m21 * m13 * m32 +
               m31 * m12 * m23  -  m31 * m13 * m22;

    let i10 = -m10 * m22 * m33  +  m10 * m23 * m32 +
               m20 * m12 * m33  -  m20 * m13 * m32 -
               m30 * m12 * m23  +  m30 * m13 * m22;

    let i20 =  m10 * m21 * m33  -  m10 * m23 * m31 -
               m20 * m11 * m33  +  m20 * m13 * m31 +
               m30 * m11 * m23  -  m30 * m13 * m21;

    let i30 = -m10 * m21 * m32  +  m10 * m22 * m31 +
               m20 * m11 * m32  -  m20 * m12 * m31 -
               m30 * m11 * m22  +  m30 * m12 * m21;

    let det = m00 * i00 + m01 * i10 + m02 * i20 + m03 * i30;
    
    // Assume det != 0 (i.e., matrix has an inverse).
      
    i00 = i00 / det;
    i10 = i10 / det;
    i20 = i20 / det;
    i30 = i30 / det;

    let i01 = (-m01 * m22 * m33  +  m01 * m23 * m32 +
                m21 * m02 * m33  -  m21 * m03 * m32 -
                m31 * m02 * m23  +  m31 * m03 * m22) / det;

    let i11 = ( m00 * m22 * m33  -  m00 * m23 * m32 -
                m20 * m02 * m33  +  m20 * m03 * m32 +
                m30 * m02 * m23  -  m30 * m03 * m22) / det;

    let i21 = (-m00 * m21 * m33  +  m00 * m23 * m31 +
                m20 * m01 * m33  -  m20 * m03 * m31 -
                m30 * m01 * m23  +  m30 * m03 * m21) / det;

    let i31 = ( m00 * m21 * m32  -  m00 * m22 * m31 -
                m20 * m01 * m32  +  m20 * m02 * m31 +
                m30 * m01 * m22  -  m30 * m02 * m21) / det;

    let i02 = ( m01 * m12 * m33  -  m01 * m13 * m32 -
                m11 * m02 * m33  +  m11 * m03 * m32 +
                m31 * m02 * m13  -  m31 * m03 * m12) / det;

    let i12 = (-m00 * m12 * m33  +  m00 * m13 * m32 +
                m10 * m02 * m33  -  m10 * m03 * m32 -
                m30 * m02 * m13  +  m30 * m03 * m12) / det;

    let i22 = ( m00 * m11 * m33  -  m00 * m13 * m31 -
                m10 * m01 * m33  +  m10 * m03 * m31 +
                m30 * m01 * m13  -  m30 * m03 * m11) / det;

    let i32 = (-m00 * m11 * m32  +  m00 * m12 * m31 +
                m10 * m01 * m32  -  m10 * m02 * m31 -
                m30 * m01 * m12  +  m30 * m02 * m11) / det;

    let i03 = (-m01 * m12 * m23  +  m01 * m13 * m22 +
                m11 * m02 * m23  -  m11 * m03 * m22 -
                m21 * m02 * m13  +  m21 * m03 * m12) / det;

    let i13 = ( m00 * m12 * m23  -  m00 * m13 * m22 -
                m10 * m02 * m23  +  m10 * m03 * m22 +
                m20 * m02 * m13  -  m20 * m03 * m12) / det;

    let i23 = (-m00 * m11 * m23  +  m00 * m13 * m21 +
                m10 * m01 * m23  -  m10 * m03 * m21 -
                m20 * m01 * m13  +  m20 * m03 * m11) / det;

    let i33 = ( m00 * m11 * m22  -  m00 * m12 * m21 -
                m10 * m01 * m22  +  m10 * m02 * m21 +
                m20 * m01 * m12  -  m20 * m02 * m11) / det;

    return new Transform([i00, i01, i02, i03,
                          i10, i11, i12, i13,
                          i20, i21, i22, i23,
                          i30, i31, i32, i33]);
  }
}
