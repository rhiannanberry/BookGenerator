import * as THREE from 'three';

// eslint-disable-next-line import/prefer-default-export
export function getTitleTexture(title) {
  const textWrap = true;
  const fontSize = 120;
  const fontFamily = 'Georgia';
  const lineHeight = 120;

  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const words = title.split(' ');
  const lines = [];
  let line = '';
  for (let n = 0; n < words.length; n += 1) {
    const lineTest = `${line + words[n]} `;
    const metrics = ctx.measureText(lineTest);
    const widthTest = metrics.width;
    if (widthTest > c.width && n > 0) {
      lines.push(line);
      line = `${words[n]} `;
    } else {
      line = lineTest;
    }
  }
  lines.push(line);
  let y = (c.height / 2) - ((lines.length / 2) * lineHeight);
  lines.forEach((s, index) => {
    ctx.fillText(s, c.width / 2, y);
    y += lineHeight;
  });

  //ctx.fillText(line, c.width / 2, y);

  return new THREE.CanvasTexture(c);
}

