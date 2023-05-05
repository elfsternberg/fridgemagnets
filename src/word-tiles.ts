import { LitElement, html, css } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import type { Word } from "./types";
import "./word-tile-board";

const background = new URL("../../assets/pingbg.png", import.meta.url).href;

async function fetchWords(src: string) {
    const request = await fetch(src);
    return await request.json();
}

@customElement("word-tiles")
export class WordTiles extends LitElement {
    @property({ type: String }) src = "";

    @state() failed: boolean = false;

    @state() wordlist: Word[] = [];

    static styles = css`
        :host {
            position: relative;
        }

        main {
            position: relative;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        if (this.wordlist.length === 0) {
            fetchWords(this.src).then(words => {
                this.wordlist = words;
            });
        }
    }

    _renderContent() {
        if (this.failed) {
            return html`<h3 class="warning">Failed to find wordlist.</h3>`;
        }

        if (this.wordlist.length === 0) {
            return html`<h3>Loading wordlist</h3>`;
        }

        return html`<word-tile-board .wordlist=${this.wordlist}></word-tile-board>`;
    }

    render() {
        return html`<main style="background: url(${background}) repeat">
            ${this._renderContent()}
        </main>`;
    }
}

export default WordTiles;
