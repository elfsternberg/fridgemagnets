import { customElement } from "lit/decorators.js";

const waitForAnimation = (elem: HTMLElement, cb: Function) => {
    const listener = () => {
        elem.removeEventListener("animationend", listener);
        cb();
    };
    elem.addEventListener("animationend", listener);
};

function createTemplate(
    x: number,
    y: number,
    total: number,
    motion: number,
    rotate: number,
    symbol: string
) {
    const template = document.createElement("template");
    template.innerHTML = `
<style>
    :host {
        position: absolute;
        --heart-default-font-size: 22px;
    }

    #heart {
        color: deeppink;
        font-size: var(--heart-font-size, var(--heart-default-font-size));
        font-weight: bold;
        animation: moveAndFade ${total} ease forwards;
    }

    @keyframes moveAndFade {
                0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        ${motion}% { transform: translate(${x}, ${y}) rotate(${rotate}deg); opacity: 1; }
              100% { transform: translate(${x}, ${y}); opacity: 0; }
         }
</style>
<div id="heart">${symbol}</div>`;
    return template;
}

@customElement("heart-atom")
export class HeartAtom extends HTMLElement {
    constructor(private symbol = "&#x02665;") {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const [distance, delay, rotate, angle] = [
            Math.floor(Math.random() * 110),
            Math.floor(Math.random() * 700 + 1200),
            Math.random() * 90 * (Math.random() < 0.5 ? 1 : -1),
            Math.random() * 2 * Math.PI,
        ];
        const [x, y] = [Math.sin(angle) * distance, Math.cos(angle) * distance];
        const total = delay + 500;
        const mo = Math.floor((100 * delay) / total);

        const template = createTemplate(x, y, total, mo, rotate, this.symbol);
        if (!this.shadowRoot) {
            throw new Error("No shadow root after attachment... wut?");
        }
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const heart = this.shadowRoot.querySelector("#heart");
        if (!heart) {
            throw new Error("Could not find animation element in heart constructor?");
        }
        waitForAnimation(this, () => this.remove());
    }
}

export default HeartAtom;
