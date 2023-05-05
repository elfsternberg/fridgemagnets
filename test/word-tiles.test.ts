import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import type { WordTiles } from '../src/word-tiles.js';
import '../src/word-tiles.js';

describe('WordTiles', () => {
  let element: WordTiles;
  beforeEach(async () => {
    element = await fixture(html`<word-tiles></word-tiles>`);
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot!.querySelector('h1')!;
    expect(h1).to.exist;
    expect(h1.textContent).to.equal('My app');
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
