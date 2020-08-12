import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from './node_modules/three/build/three.module.js';

function main() {

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 10;

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 2.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 12);
    scene.add(light);
  }

  const bookSize = { x: 3, y: 6, z: 10 };
  var coverThickness = 0.5; // coverThickness < bookSize.y, coverThickness < bookSize.x / 2
  const paperSize = { y: 5.2, z: 9 }; // y < bookSize.y + coverThickness, z < bookSize.z
  const spineCurve = 0;

  const coverBoundingBox = {
    min: {
      x: -bookSize.x / 2, y: -bookSize.y / 2, z: -bookSize.z / 2,
    },
    max: {
      x: bookSize.x / 2, y: bookSize.y / 2, z: bookSize.z / 2,
    },
  };

  const paperBoundingBox = {
    min: {
      x: coverBoundingBox.min.x + coverThickness,
      y: coverBoundingBox.max.y - coverThickness - paperSize.y,
      z: -paperSize.z / 2,
    },
    max: {
      x: coverBoundingBox.max.x - coverThickness,
      y: coverBoundingBox.max.y - coverThickness,
      z: paperSize.z / 2,
    },
  };

  const coverOuterY = [];
  const paperOuterY = [];
  const paperInnerY = [];

  const col1 = [];
  const col2 = [];
  const col3 = [];
  const col4 = [];
  const col5 = [];
  const col6 = [];
  const col7 = [];

  const outerZ = [];
  const innerZ = [];

  const updateSegment = {
    cover: { x: true, y: true, z: true },
    paper: { x: true, y: true, z: true },
    coverThickness: true,
  };

  const colorLoop = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255,
    255, 255, 0,
    0, 255, 255,
    255, 0, 255,
  ]);

  let bk = null;

  const loader = new GLTFLoader();
  loader.load('unit_book_merged.glb', (gltf) => {
    const cnt = gltf.scene.children[0].geometry.attributes.position.count;
    let sequencePosition = 0; // x,y,z
    const vertexArray = gltf.scene.children[0].geometry.attributes.position.array;
    const colors = [];
    bk = gltf.scene.children[0];
    vertexArray.forEach((e, index) => {
      if (sequencePosition === 0) {
        if (Math.abs(e) < 0.05) {

        } else if (Math.abs(e) <= 0.2) {
          col1.push([index, (1 / 6), Math.sign(e)]);
        } else if (Math.abs(e) <= 0.4) {
          col2.push([index, 1 / 2, Math.sign(e)]);
        } else if (Math.abs(e) <= 0.55) {
          col3.push([index, 5 / 6, Math.sign(e)]);
        } else if (Math.abs(e) <= 0.65) {
          col4.push([index, 1, Math.sign(e)]);
        } else if (Math.abs(e) <= 0.75) {
          col5.push([index, 3 / 4, Math.sign(e)]);
        } else if (Math.abs(e) <= 0.95) {
          col6.push([index, 1 / 4, Math.sign(e)]);
        } else {
          col7.push([index, 1, Math.sign(e)]);
        }
      } else if (sequencePosition === 1) {
        // colors.push(255*e);
        if (Math.abs(e) >= 0.95) {
          coverOuterY.push([index, e]);
        } else if (Math.abs(e) >= 0.55) {
          paperOuterY.push([index, Math.sign(e)]);
        } else if (e < 0.25) {
          paperInnerY.push([index, 1]);
        } else {
          paperInnerY.push([index, 0.25]);
        }
      } else if (sequencePosition === 2) {
        if (Math.abs(e) <= 0.65) {
          innerZ.push([index, Math.sign(e)]);
        } else {
          outerZ.push([index, Math.sign(e)]);
        }
      }
      colors.push(colorLoop[index % 18]);
      sequencePosition = (sequencePosition + 1) % 3;
    });

    function resizePaperX(newX) {
      const w2t = bookSize.x / 2 - coverThickness;

      col1.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col2.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col3.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col4.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col5.forEach((v) => { vertexArray[v[0]] = ((bookSize.x / 2) - (v[1] * coverThickness)) * v[2]; });
      col6.forEach((v) => { vertexArray[v[0]] = ((bookSize.x / 2) - (v[1] * coverThickness)) * v[2]; });
      col7.forEach((v) => { vertexArray[v[0]] = v[1] * (bookSize.x / 2) * v[2]; });
    }

    function resizePaperZ(newZ) {
      paperSize.z = newZ;
      innerZ.forEach((v) => { vertexArray[v[0]] = v[1] * (paperSize.z / 2); });
    }

    function resizePaperY(newY) {
      paperSize.y = newY;
      const y2 = bookSize.y / 2;
      const p2 = paperSize.y / 2;
      const pOffset = y2 - coverThickness - p2;
      paperOuterY.forEach((v) => { vertexArray[v[0]] = (v[1] * p2) + pOffset; });
      paperInnerY.forEach((v) => { vertexArray[v[0]] = y2 - coverThickness - (v[1] * coverThickness)})
    }

    function resizeCoverThickness(newThickness) {
      coverThickness = newThickness;

      resizePaperY(paperSize.y);

      const w2t = bookSize.x / 2 - coverThickness;

      col1.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col2.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col3.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col4.forEach((v) => { vertexArray[v[0]] = v[1] * w2t * v[2]; });
      col5.forEach((v) => { vertexArray[v[0]] = ((bookSize.x / 2) - (v[1] * coverThickness)) * v[2]; });
      col6.forEach((v) => { vertexArray[v[0]] = ((bookSize.x / 2) - (v[1] * coverThickness)) * v[2]; });
      col7.forEach((v) => { vertexArray[v[0]] = v[1] * (bookSize.x / 2) * v[2]; });
    }
    
    function resizeCoverY(newY) {
      bookSize.y = newY;
      const y2 = bookSize.y / 2;
      coverOuterY.forEach((v) => { vertexArray[v[0]] = v[1] * y2; });
      resizeCoverThickness(coverThickness);
      
    }
    function resizeCoverZ(newZ) {
      bookSize.z = newZ;
      outerZ.forEach((v) => { vertexArray[v[0]] = v[1] * (bookSize.z / 2); });
    }
    resizeCoverY(bookSize.y);
    resizeCoverZ(bookSize.z);
    resizePaperX(paperSize.x);
    resizePaperZ(paperSize.z);

    
    

    gltf.scene.children[0].geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
    gltf.scene.children[0].material.vertexColors = THREE.VertexColors;
    console.log(gltf.scene.children[0].geometry.attributes.color.array);
    scene.add(gltf.scene);
  }, undefined, (error) => {
    console.error(error);
  });

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    if (bk) {
      bk.rotation.y = time * 0.5;
      //bk.rotation.x = time * 0.3;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  document.querySelector("input").addEventListener("change", (e) => {
    console.log(e);
  });
}

main();

