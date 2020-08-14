import * as THREE from 'three/build/three.module';
import Book from './book';
import grab from './wikigrab';
// processing, updating, rendering, ui

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 11;

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
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

  const titleButton = document.querySelector('#title > button');
  const title = document.querySelector('#title > span');
  function getTitle() {
    grab((data) => { title.innerHTML = data; });
  }
  titleButton.addEventListener('click', getTitle);
  getTitle();

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
      book.model.rotation.z = time * 0.5;
      // book.model.rotation.x = time * 0.3;
    }

    book.update();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
