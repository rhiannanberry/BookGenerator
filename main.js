import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from './node_modules/three/build/three.module.js';
import Book from './js/book.js';
//processing, updating, rendering, ui

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

  const spineCurve = 0;


  const colorLoop = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255,
    255, 255, 0,
    0, 255, 255,
    255, 0, 255,
  ]);
  const book = new Book('unit_book_merged.glb', scene);
  /*
  let bk = null;

  const loader = new GLTFLoader();
  loader.load('unit_book_merged.glb', (gltf) => {
    const cnt = gltf.scene.children[0].geometry.attributes.position.count;
    let sequencePosition = 0; // x,y,z
    const vertexArray = gltf.scene.children[0].geometry.attributes.position.array;
    const colors = [];
    bk = gltf.scene.children[0];
    vertexArray.forEach((e, index) => {
      const ee = e.toFixed(1);
      if (sequencePosition === 0) {
        if (Math.abs(ee) <= 0.6) {
          col.push([index, ee]);
        } else {
          coll2.push([index, ee]);
        }
      } else if (sequencePosition === 1) {
        // colors.push(255*e);
        if (ee <= 0.6 && ee >= 0.2) {
          innerY.push([index, ee]);
        } else if (ee == -0.6) {
          paperEdgeY.push([index, -1]);
        }
        if (Math.abs(e) >= 0.95) {
          coverOuterY.push([index, e]);
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

      col.forEach((v) => { vertexArray[v[0]] = v[1] * (10 / 6) * w2t; });
      coll2.forEach((v) => {
        const off = (Math.abs(v[1]) - 0.6) * (10 / 4) * coverThickness;
        vertexArray[v[0]] = (w2t + off) * Math.sign(v[1]);
      });
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
      paperEdgeY.forEach((v) => { vertexArray[v[0]] = (v[1] * p2) + pOffset; });
      innerY.forEach((v) => {
        const off = (0.6 - v[1]) * (10 / 4) * coverThickness;
        vertexArray[v[0]] = y2 - coverThickness - off;
      });
    }

    function resizeCoverThickness(newThickness) {
      coverThickness = newThickness;

      resizePaperY(paperSize.y);

      const w2t = bookSize.x / 2 - coverThickness;
      col.forEach((v) => { vertexArray[v[0]] = v[1] * w2t; });
      coll2.forEach((v) => {
        const off = (Math.abs(v[1]) - 0.6) * (10 / 4) * coverThickness;
        vertexArray[v[0]] = (w2t + off) * Math.sign(v[1]);
      });
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

  */
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

    if (book.model) {
      book.model.rotation.y = time * 0.5;
      // bk.rotation.x = time * 0.3;
    }

    book.update();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
