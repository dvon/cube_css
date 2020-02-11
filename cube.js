import { Transform } from "./transform.js";

let SCALE = 90;
let CCW = 1, CW = -1;

let wp = new Promise(
    function(resolve) { 
      window.onload = resolve;
    });

wp.then(main);

class SubCube {

  constructor(cubeTransform, tx, ty, tz) {
    this.tx = tx;
    this.ty = ty;
    this.tz = tz;
    this.transform = new Transform();
    this.transform.translate(SCALE * tx, SCALE * ty, SCALE * tz);
    this.outward = [tz == 1, tx == 1, tz == -1, tx == -1,
        ty == -1, ty == 1];
    
    let faceDiv = (index) => {
      let b = document.createElement("div");
      b.className = "face-border";
      b.style.width = b.style.height = `${SCALE}px`;
      document.querySelector("#cube").appendChild(b);
      
      if (this.outward[index]) {
        let c = document.createElement("div");
        c.className = `face-${index + 1}`;
        c.style.left = c.style.top = `${SCALE / 20}px`;
        c.style.width = c.style.height = `${SCALE - SCALE / 10}px`;
        c.style.backfaceVisibility = "hidden";
        
        let xOffset = -SCALE / 20;
        let yOffset = -SCALE / 20;
        
        if (index == 0 || index == 2) {
          xOffset += -SCALE * (tz * tx + 1);
          yOffset += -SCALE * (ty + 1);
        } else if (index == 1 || index == 3) {
          xOffset += -SCALE * (-tx * tz + 1);
          yOffset += -SCALE * (ty + 1);
        } else {
          xOffset += -SCALE * (tz + 1);
          yOffset += -SCALE * (ty * tx + 1);
        }
       
        c.style.backgroundSize = `${SCALE * 3}px ${SCALE * 3}px`;
        c.style.backgroundPositionX = `${xOffset}px`;
        c.style.backgroundPositionY = `${yOffset}px`;
        c.style.backgroundRepeat = "no-repeat";
        
        b.appendChild(c);
      }
      
      return b;
    };
    
    this.divs = [faceDiv(0), faceDiv(1), faceDiv(2),
                 faceDiv(3), faceDiv(4), faceDiv(5)];
    
    this.updateDivTransforms(cubeTransform);
  }
  
  updateBackgroundImages(index) {
  
    if (this.outward[index]) {
      let c = this.divs[index].firstElementChild;
      let f = document.querySelector(`#file-${index + 1}`);

      if (f.files[0]) {
        let r = new FileReader();
        r.readAsDataURL(f.files[0]);
        
        let p = new Promise(resolve => { r.onload = resolve; });
        p.then(event =>
            { c.style.backgroundImage = `url(${event.target.result})`; });
      }
    }
  }
  
  clearBackgroundImages(index) {
  
    if (this.outward[index]) {
      let c = this.divs[index].firstElementChild;
      c.style.backgroundImage = "none";
    }
  }
  
  updateDivTransforms(cubeTransform) {
    
    let updateDivTransform = (index) => {
      let t = new Transform();
      t.multiplyBy(cubeTransform);
      t.multiplyBy(this.transform);
      t.translate(0, 0, SCALE / 2);
      let z = Math.round(t.transformVertex([0, 0, 1])[2]);
      this.divs[index].style.zIndex = z;
      this.divs[index].style.transform = `matrix3d(${t.matrixT})`;
    }
  
    this.transform.push();
    updateDivTransform(0);
    this.transform.rotateY(90);
    updateDivTransform(1);
    this.transform.rotateY(90);
    updateDivTransform(2);
    this.transform.rotateY(90);
    updateDivTransform(3);
    this.transform.rotateX(90);
    updateDivTransform(4);
    this.transform.rotateX(180);
    updateDivTransform(5);
    this.transform.pop();
  }
  
  rotateTx(d) {
    let ty = this.ty;
    this.ty = -d * this.tz;
    this.tz = d * ty;
  }
  
  rotateTy(d) {
    let tx = this.tx;
    this.tx = d * this.tz;
    this.tz = -d * tx;
  }
  
  rotateTz(d) {
    let tx = this.tx;
    this.tx = -d * this.ty;
    this.ty = d * tx;
  }
  
  rotateT(axis, d) {
  
    if (axis == "X") {
      this.rotateTx(d);
    } else if (axis == "Y") {
      this.rotateTy(d);
    } else if (axis == "Z") {
      this.rotateTz(d);
    }
  }
}

function main() {
  let t = new Transform();
  t.translate(200 - SCALE / 2, 150 - SCALE / 2, 0);
  t.rotateX(-25).rotateY(-35);

  let subCubes = [];
  
  for (let tx = -1; tx <= 1; tx++)
    for (let ty = -1; ty <= 1; ty++)
      for (let tz = -1; tz <= 1; tz++)
        subCubes.push(new SubCube(t, tx, ty, tz));

  function rotate(group, axis, dir, n, callback) {
  
    // t.rotateX(0.5).rotateY(0.2).rotateZ(0.1);
    // for (let c of subCubes) c.updateDivTransforms(t);
  
    if (n == 0) {
      for (let c of group) c.rotateT(axis, dir);
      if (callback) setTimeout(callback, 500);
    
    } else {
      let a = 5;
      
      if      (n > 4 * a) n -= a;
      else if (n > 3 * a) n -= (a = 4);
      else if (n > 2 * a) n -= (a = 3);
      else if (n > a)     n -= (a = 2);
      else                n -= (a = 1);
      
      for (let c of group) {
        c.transform.preRotate(axis, dir * a);
        c.updateDivTransforms(t);
      }
      
      t.rotate(axis, -dir * a / 5);
      for (let c of subCubes) c.updateDivTransforms(t);
      
      requestAnimationFrame(
          function() {
            rotate(group, axis, dir, n, callback);
          });
    }
  }
  
  function randomRotate() {
  
    return new Promise(
        function (resolve) {
          let r = (n) => Math.floor(Math.random() * n);
          let t = r(3) - 1;
          let g = [(c) => c.tx == t,
                   (c) => c.ty == t,
                   (c) => c.tz == t]
          let a = r(3);
          
          rotate(subCubes.filter(g[a]), "XYZ".charAt(a),
              r(2) ? CCW : CW, 90, resolve);
        });
  }

  function shuffle(n) {
    let rp = randomRotate();
  
    for (let i = 1; i < n; i++)
      rp = rp.then(randomRotate);
    
    return rp;
  }
  
  for (let i = 0; i < 6; i++) {
  
    for (let c of subCubes)
      c.updateBackgroundImages(i);
  
    let f = document.querySelector(`#file-${i + 1}`);
    f.addEventListener("change",
        function() {
          for (let c of subCubes)
            c.updateBackgroundImages(i);
        }); 
  }
  
  document.querySelector("#shuffle").addEventListener(
      "click", () => { shuffle(100); });
  
  document.querySelector("#clear").addEventListener("click",
      function() {
        document.querySelector("form").reset();
      
        for (let i = 0; i < 6; i++) {
          for (let c of subCubes)
            c.clearBackgroundImages(i);
        }
      });
}
