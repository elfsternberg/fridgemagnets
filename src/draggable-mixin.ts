import { LitElement } from "lit";

type Drag = {
    // Where the drag started from
    initialLocation: { left: number; top: number } | null;

    // Mouse offset within the clicked component; used to calculate new top/left after drop;
    initialOffset: { left: number; top: number };

    // cached value of select on the dragged component, used to restore select options drag ends.
    select: string;

    // The pointer id we're tracking for this drag-and-drop; used to disambiguate in multi-touch
    // environments.

    pointerId: null | number;
};

type DragApi = {
    start: (event: PointerEvent) => void;
    move: (event: PointerEvent) => void;
    end: (event: PointerEvent) => void;
    nop: (event: Event) => void;
};

type Constructor<T = {}> = new (...args: any[]) => T;

export function DraggableElement<T extends Constructor<LitElement>>(superclass: T) {
    return class Draggable extends superclass {
        _drag: Drag = {
            initialOffset: { left: 0, top: 0 },
            initialLocation: { left: 0, top: 0 },
            select: "",
            pointerId: null,
        };

        _drag_api: DragApi;

        constructor(...rest: any) {
            super(...rest);
            this._drag_api = {
                start: this.__dragStart.bind(this),
                move: this.__dragMove.bind(this),
                end: this.__dragEnd.bind(this),
                nop: (e: Event) => {
                    e.preventDefault();
                },
            };
        }

        __dragStart(event: PointerEvent) {
            if (event.button !== 0 || event.ctrlKey) {
                return;
            }

            // Don't bubble; if we need to inform a parent, we will do so ourselves.
            event.stopPropagation();

            // Only track this pointer.
            this.setPointerCapture(event.pointerId);
            this._drag.pointerId = event.pointerId;

            // We're dragging an HTML object. So we want two different things: we need to record the
            // *offset* of the mouse button with respect to the object's top/left, so we know where
            // to put it when we put it down, and we need to record the mouse moves for the
            // transition.
            const location = this.getBoundingClientRect();
            this._drag.initialOffset = {
                top: event.clientY - location.y,
                left: event.clientX - location.x,
            };
            this._drag.initialLocation = { top: event.clientY, left: event.clientX };

            // Record existing user select rules, then disable it.
            this._drag.select = this.style.userSelect ?? this.style.webkitUserSelect ?? "";
            this.style.userSelect = "none"; // Don't highlight/select the text inside
            this.style.webkitUserSelect = "none";
            const response = new CustomEvent("tile-drag-start", {
                composed: true,
                bubbles: true,
                detail: { node: this },
            });
            this.dispatchEvent(response);
        }

        __dragEnd(event: PointerEvent) {
            if (
                this._drag.initialLocation === null ||
                this._drag.pointerId !== event.pointerId
            ) {
                return;
            }

            this.releasePointerCapture(this._drag.pointerId);
            this.style.userSelect = this._drag.select;
            this.style.webkitUserSelect = this._drag.select;

            const reference = this.parentElement?.getBoundingClientRect();
            if (!reference) {
                throw new Error(
                    "Using word tiles outside of the board doesn't make sense."
                );
            }

            this._drag.initialLocation = null;
            this.dispatchEvent(
                new CustomEvent("tile-drag-end", {
                    composed: true,
                    bubbles: true,
                    detail: {
                        node: this,
                        loc: {
                            top:
                                event.clientY -
                                reference.top -
                                this._drag.initialOffset.top,
                            left:
                                event.clientX -
                                reference.left -
                                this._drag.initialOffset.left,
                        },
                    },
                })
            );
        }

        __dragMove(event: PointerEvent) {
            if (
                this._drag.initialLocation === null ||
                this._drag.pointerId !== event.pointerId
            ) {
                return;
            }
            event.stopPropagation(); // for nested draggables

            const response = new CustomEvent("tile-drag-move", {
                composed: true,
                bubbles: true,
                detail: {
                    node: this,
                    pos: {
                        top: event.clientY - this._drag.initialLocation.top,
                        left: event.clientX - this._drag.initialLocation.left,
                    },
                },
            });
            this.dispatchEvent(response);
        }

        connectedCallback() {
            super.connectedCallback();
            this.addEventListener("pointerdown", this._drag_api.start);
            this.addEventListener("pointerup", this._drag_api.end);
            this.addEventListener("pointercancel", this._drag_api.end);
            this.addEventListener("pointermove", this._drag_api.move);
            this.addEventListener("dragstart", this._drag_api.nop);
            this.addEventListener("touchstart", this._drag_api.nop);
        }

        disconnectedCallback() {
            this.removeEventListener("pointerdown", this._drag_api.start);
            this.removeEventListener("pointerup", this._drag_api.end);
            this.removeEventListener("pointercancel", this._drag_api.end);
            this.removeEventListener("pointermove", this._drag_api.move);
            this.removeEventListener("dragstart", this._drag_api.nop);
            this.removeEventListener("touchstart", this._drag_api.nop);
            super.disconnectedCallback;
        }
    };
}

export default DraggableElement;
