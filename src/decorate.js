import * as THREE from 'three';

// eslint-disable-next-line import/prefer-default-export
export function getTitleTexture(title) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, c.width / 2, c.height / 2);

  return new THREE.CanvasTexture(c);
}
