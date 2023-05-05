import { LitElement, html, css, TemplateResult } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import { query } from "lit/decorators/query.js";
import { isCustomEvent, shuffle } from "./helpers";
import { Poem } from "./poem";
import type { Word } from "./types";
import type WordTile from "./word-tile";
import "./word-tile";
import "./heart-atom";

const FACTOR = 12000;
const FALLBACK = 1024 * 768;

const isWordTile = (v: any): v is WordTile => typeof v === "object" && "collides" in v;

@customElement("word-tile-board")
export class WordTileBoard extends LitElement {
    @property({ type: Array<Word> }) wordlist = [];

    @state() current_words: Word[] = [];

    @query("main") board!: HTMLElement;

    poem: Poem;

    tiles: TemplateResult[] = [];

    static styles = css`
        :host {
            display: block;
            position: relative;
            height: 100%;
            width: 100%;
        }

        main {
            position: relative;
            display: block;
            height: 100%;
            width: 100%;
        }

        word-tile {
            position: absolute;
        }
    `;

    constructor() {
        super();
        this.poem = new Poem(this);
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.current_words.length === 0) {
            this.current_words = this.calculateCurrentWords();
        }
        this.generateCurrentTiles();

        this.addEventListener("tile-lifted", (event: Event) => {
            if (!isCustomEvent(event)) {
                throw new Error("tile-lifted should not receive a standard event.");
            }
            const newPlane = this.setZIndices(event.detail.tile);
        });

        this.addEventListener("tile-moved", (event: Event) => {
            if (!isCustomEvent(event)) {
                throw new Error("tile-moved should not receive a standard event.");
            }
            this.hearts(event.detail.tile);
            this.checkForPoem(event.detail.tile);
        });
    }

    attributeChangedCallback(name: string, old: any, value: any) {
        super.attributeChangedCallback(name, old, value);
        if (name === "wordlist") {
            this.calculateCurrentWords();
            this.generateCurrentTiles();
        }
    }

    checkForPoem(tile: WordTile) {
        this.poem.check(tile);
        if (this.poem.poem.length > 0) {
            this.dispatchEvent(
                new CustomEvent("poem-changed", {
                    composed: true,
                    bubbles: true,
                    detail: {
                        poem: this.poem.poem,
                    },
                })
            );
        }
    }

    hearts(tile: WordTile) {
        const theZ = parseInt(tile.style.zIndex, 0);
        const pos = tile.getPos();
        const hearts = [];
        const count = 22 + (6 - Math.floor(Math.random() * 12));
        for (let i = 0; i < count; i++) {
            hearts.push(`<heart-atom style="top: ${pos.top}px; left: ${pos.left}px; z-index: ${theZ - 1}"></heart-atom>`);
        }
        this.renderRoot.innerHTML += hearts.join('');
    }

    setZIndices(tile: WordTile) {
        const allTiles = this.getCurrentTiles();
        allTiles.sort(
            (a, b) =>
                (parseInt(a.style.zIndex, 10) || 0) - (parseInt(b.style.zIndex, 10) || 0)
        );
        allTiles.forEach((tile, index) => (tile.style.zIndex = `${index}`));
        tile.style.zIndex = `${allTiles.length + 2}`;
    }

    getCurrentTiles(): WordTile[] {
        const board = this.renderRoot.querySelector("main");
        if (!board) {
            throw new Error("Can't find my own board?");
        }
        return Array.from(board.getElementsByTagName("word-tile")).reduce(
            (acc: WordTile[], tile: any): WordTile[] => [
                ...acc,
                ...(isWordTile(tile) ? [tile] : []),
            ],
            [] as WordTile[]
        );
    }

    calculateCurrentWords() {
        const parent = this.parentElement;
        if (!parent) {
            throw new Error("No parent element after connection?");
        }
        const { height, width } = parent.getBoundingClientRect();
        const mulfactor = height > 0 && width > 0 ? height * width : FALLBACK;
        const addprob = mulfactor / FACTOR / this.wordlist.length;
        return shuffle(
            this.wordlist.reduce(
                (acc, word) => [...acc, ...(Math.random() < addprob ? [word] : [])],
                []
            )
        );
    }

    getSafePosition() {
        const { height, width } = this.getBoundingClientRect();
        return `top: ${Math.floor(Math.random() * height * 0.985)}px; left: ${Math.floor(
            Math.random() * width * 0.98
        )}px`;
    }

    generateCurrentTiles() {
        this.tiles = this.current_words.map(
            (word: Word, index: number) =>
                html`<word-tile style="${this.getSafePosition()}; z-index:${index}"
                    >${word.w}</word-tile>`
        );
    }
    render() {
        return html`<main>${this.tiles}</main> `;
    }
}

export default WordTileBoard;
