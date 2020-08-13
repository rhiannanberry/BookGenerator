/* eslint-disable no-underscore-dangle */
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/GLTFLoader.js';

export default class Book {
  constructor(src, scene) {
    this.loaded = false;
    this.model = null;
    this.vertices = null;

    this._scale = {
      book: { x: 0, y: 0, z: 0 },
      paper: { y: 0, z: 0 },
      coverThickness: 0,
    };
    this.scale = {
      book: { x: 3, y: 6, z: 10 },
      paper: { y: 5.2, z: 9 },
      coverThickness: 0.5,
    };

    (new GLTFLoader()).load(src, (gltf) => {
      [this.model] = gltf.scene.children;
      this.vertices = this.model.geometry.attributes.position.array;
      scene.add(this.model);
      this.preprocess();
    }, undefined, (error) => {
      console.error(error);
    });
    // process
  }

  // all setters need validation, and will return the validated or clamped value

  setBookScaleX(newX) {
    this.scale.book.x = Math.max(newX, this.scale.coverThickness * this.scale.coverThickness);
    return this.scale.book.x;
  }

  setBookScaleY(newY) {
    this.scale.book.y = Math.max(newY, this.scale.paper.y + this.scale.coverThickness);
    return this.scale.book.y;
  }

  setBookScaleZ(newZ) {
    this.scale.book.z = Math.max(newZ, this.scale.paper.z);
    return this.scale.book.z;
  }

  setPaperScaleY(newY) {
    this.scale.paper.y = Math.min(newY, this.scale.book.y - this.scale.coverThickness);
    return this.scale.paper.y;
  }

  setPaperScaleZ(newZ) {
    this.scale.paper.z = Math.min(newZ, this.scale.book.z);
    return this.scale.paper.z;
  }

  setCoverThickness(newThickness) {
    this.scale.coverThickness = Math.min(newThickness, this.scale.book.x / 2,
      this.scale.book.y - this.scale.paper.y);
    return this.scale.coverThickness;
  }

  preprocess() {
    this.vertexGroups = {
      x: { pages: [], cover: [] },
      y: { pages: [], pageEdge: [], cover: [] },
      z: { pages: [], cover: [] },
    };

    let sequencePosition = 0; // x, y, z

    this.vertices.forEach((e, index) => {
      const v = e.toFixed(1);
      switch (sequencePosition) {
        case 0: // x
          if (Math.abs(v) <= 0.6) {
            this.vertexGroups.x.pages.push([index, v]);
          } else {
            this.vertexGroups.x.cover.push([index, v]);
          }
          break;
        case 1: // y
          if (Math.abs(v) >= 1) {
            this.vertexGroups.y.cover.push([index, v]);
          } else if (v == -0.6) {
            this.vertexGroups.y.pageEdge.push([index, -1]);
          } else {
            this.vertexGroups.y.pages.push([index, v]);
          }
          break;
        default: // z
          if (Math.abs(v) <= 0.6) {
            this.vertexGroups.z.pages.push([index, Math.sign(v)]);
          } else {
            this.vertexGroups.z.cover.push([index, Math.sign(v)]);
          }
      }
      sequencePosition = (sequencePosition + 1) % 3;
    });
    const bookX = document.querySelector('#book-thickness > input');
    const bookY = document.querySelector('#book-width > input');
    const bookZ = document.querySelector('#book-height > input');

    const paperY = document.querySelector('#paper-width > input');
    const paperZ = document.querySelector('#paper-height > input');
    const coverThickness = document.querySelector('#cover-thickness > input');

    bookX.value = this.scale.book.x;
    bookY.value = this.scale.book.y;
    bookZ.value = this.scale.book.z;

    paperY.value = this.scale.paper.y;
    paperZ.value = this.scale.paper.z;

    coverThickness.value = this.scale.coverThickness;

    bookX.addEventListener('input', () => { bookX.value = this.setBookScaleX(bookX.value); });
    bookY.addEventListener('input', () => { bookY.value = this.setBookScaleY(bookY.value); });
    bookZ.addEventListener('input', () => { bookZ.value = this.setBookScaleZ(bookZ.value); });

    paperY.addEventListener('input', () => { paperY.value = this.setPaperScaleY(paperY.value); });
    paperZ.addEventListener('input', () => { paperZ.value = this.setPaperScaleZ(paperZ.value); });

    coverThickness.addEventListener('input', () => { coverThickness.value = this.setCoverThickness(coverThickness.value); });

    this.loaded = true;
    this.update();
  }

  update() {
    if (!this.loaded) return;
    let updateModel = false;

    if (this.scale.paper.y !== this._scale.paper.y
      || this.scale.book.y !== this._scale.book.y
      || this.scale.coverThickness !== this._scale.coverThickness) {
      const halfBookY = this.scale.book.y / 2;
      const halfPaperY = this.scale.paper.y / 2;
      const topPaperY = halfBookY - this.scale.coverThickness - halfPaperY;
      this.vertexGroups.y.pageEdge.forEach((v) => {
        this.vertices[v[0]] = (v[1] * halfPaperY) + topPaperY;
      });
      this._scale.paper.y = this.scale.paper.y;
      updateModel = true;
    }

    if (this.scale.paper.z !== this._scale.paper.z) {
      this.vertexGroups.z.pages.forEach((v) => {
        this.vertices[v[0]] = v[1] * (this.scale.paper.z / 2);
      });
      this._scale.paper.z = this.scale.paper.z;
      updateModel = true;
    }

    if (this.scale.book.x !== this._scale.book.x
      || this.scale.coverThickness !== this._scale.coverThickness) {
      const halfBookX = this.scale.book.x / 2;
      const hbxCover = halfBookX - this.scale.coverThickness;

      this.vertexGroups.x.pages.forEach((v) => {
        this.vertices[v[0]] = v[1] * (10 / 6) * hbxCover;
      });

      const magicNum = (10 / 4) * this.scale.coverThickness;
      this.vertexGroups.x.cover.forEach((v) => {
        const offset = (Math.abs(v[1]) - 0.6) * magicNum;
        this.vertices[v[0]] = (hbxCover + offset) * Math.sign(v[1]);
      });

      this._scale.book.x = this.scale.book.x;
      updateModel = true;
    }

    if (this.scale.coverThickness !== this._scale.coverThickness
      || this.scale.book.y !== this._scale.book.y) {
      const halfBookY = this.scale.book.y / 2;
      const magicNum = (10 / 4) * this.scale.coverThickness;
      this.vertexGroups.y.pages.forEach((v) => {
        const offset = (0.6 - v[1]) * magicNum;
        this.vertices[v[0]] = halfBookY - this.scale.coverThickness - offset;
      });
      this._scale.coverThickness = this.scale.coverThickness;
      updateModel = true;
    }

    if (this.scale.book.y !== this._scale.book.y) {
      const halfBookY = this.scale.book.y / 2;
      this.vertexGroups.y.cover.forEach((v) => { this.vertices[v[0]] = v[1] * halfBookY; });
      this._scale.book.y = this.scale.book.y;
      updateModel = true;
    }

    if (this.scale.book.z !== this._scale.book.z) {
      this.vertexGroups.z.cover.forEach((v) => {
        this.vertices[v[0]] = v[1] * (this.scale.book.z / 2);
      });
      this._scale.book.z = this.scale.book.z;
      updateModel = true;
    }
    if (updateModel) {
      this.model.geometry.attributes.position.needsUpdate = true;
    }
  }
}
