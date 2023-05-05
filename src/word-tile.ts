import { LitElement, css, html } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import { state, customElement } from 'lit/decorators.js';
import { isCustomEvent, collides } from './helpers';
import DraggableElement from './draggable-mixin';

/* WordTile

   A <word-tile> element is a fairly simple element that does nothing more than encapsulate a word
   tile with a small bit of rotation (a kilter between 15° and -15°), a border and a small drop
   shadow. If the classname "lifted" is added to the host tag, the rotation is changed, the item is
   enlarged by a small amount, and so is the drop shadow, to simulate picking it up.
*/

const FUZZ_HEIGHT = 8;
const FUZZ_WIDTH = 6;

type Box = [number, number, number, number];

const rotate = () => `rotate(${Math.random() * 30 - 15}deg)`;

@customElement('word-tile')
export class WordTile extends DraggableElement(LitElement) {
  static styles = css`
    :host {
      --word-default-font-family: Georgia, Palatino, 'Palatino Linotype', Times, 'Times New Roman', serif;
      --word-default-font-size: 13px;
      --word-default-box-shadow: 0 0 6px 2px #aaa;
      --word-default-color: #444;
      --word-default-padding: 4px 4px 3px 4px;

      z-index: 100;
      font-family: var(--word-font-family, var(--word-default-font-family));
      font-size: var(--word-font-size, var(--word-default-font-size));
    }

    #word {
      cursor: pointer;
      position: absolute;
      background: white;
      line-height: 1;
      box-shadow: var(--word-box-shadow, var(--word-default-box-shadow));
      color: var(--word-color, var(--word-default-color));
      padding: var(--word-padding, var(--word-default-padding));
      text-align: center;
      user-select: none;
      transform-origin: center;
      transition: transform 0.3s;
    }
  `;

  @state()
  livestyle = rotate();

  word = '';

  getSize() {
    const node = this.renderRoot.querySelector('#word');
    if (!node) {
      throw new Error('Node has no children? CANTHAPPEN');
    }
    const size = node.getBoundingClientRect();
    return { width: size.width, height: size.height };
  }

  getPos() {
    const { left, top } = this.getBoundingClientRect();
    return { left, top };
  }

  get boundingBox(): Box {
    const rect = this.getPos();
    const size = this.getSize();
    const [x, y, w, h] = [
      rect.left - FUZZ_WIDTH,
      rect.top - FUZZ_HEIGHT,
      size.width + 2 * FUZZ_WIDTH,
      size.height + 2 * FUZZ_HEIGHT,
    ];
    return [x, y, x + w, y + h];
  }

  collides(other: WordTile) {
    // You cannot collide with yourself
    if (other === this) {
      return false;
    }
    return collides(this.boundingBox, other.boundingBox);
  }

  dragStart(event: Event) {
    if (!isCustomEvent(event)) {
      throw new Error('tile-drag-move sent unexpected event');
    }
    this.livestyle = `${rotate()} scale(1.4)`;
    this.dispatchEvent(
      new CustomEvent('tile-lifted', {
        composed: true,
        bubbles: true,
        detail: {
          tile: this,
        },
      })
    );
  }

  dragMove(event: Event) {
    if (!isCustomEvent(event)) {
      throw new Error('tile-drag-move sent unexpected event');
    }
    this.style.transform = `translate(${event.detail.pos.left}px, ${event.detail.pos.top}px)`;
  }

  dragEnd(event: Event) {
    if (!isCustomEvent(event)) {
      throw new Error('tile-drag-move sent unexpected event');
    }
    this.style.top = `${event.detail.loc.top}px`;
    this.style.left = `${event.detail.loc.left}px`;
    this.style.transform = '';
    this.livestyle = `${rotate()} scale(1.0)`;
    this.dispatchEvent(
      new CustomEvent('tile-moved', {
        composed: true,
        bubbles: true,
        detail: {
          tile: this,
          word: this.word,
        },
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    const wordNode = Array.from(this.childNodes).find(node => node.nodeType === 3);
    this.word = (wordNode as Text).wholeText;
    this.addEventListener('tile-drag-start', this.dragStart.bind(this));
    this.addEventListener('tile-drag-move', this.dragMove.bind(this));
    this.addEventListener('tile-drag-end', this.dragEnd.bind(this));
  }

  disconnectedCallback() {
    super.connectedCallback();
    this.removeEventListener('tile-drag-start', this.dragStart.bind(this));
    this.removeEventListener('tile-drag-move', this.dragMove.bind(this));
    this.removeEventListener('tile-drag-end', this.dragEnd.bind(this));
    super.disconnectedCallback();
  }

  render() {
    return html` <div id="word" style=${styleMap({ transform: this.livestyle })}>${this.word}</div>`;
  }
}

export default WordTile;
