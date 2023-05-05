import type { WordTileBoard } from "./word-tile-board";
import type { WordTile } from "./word-tile";

type Box = [number, number, number, number];
type PoemTiles = WordTile[];

// A Poem is three or more *moved* words in fuzzy collision. If a word has not been moved, it can
// only become part of a poem by being touched by a moved word. Coincidental "found" poems can only
// be found by moving one of the words to trigger this algorithm.

// The tricky part of this is that, if a word is taken out of the poem, you can have two poems, and
// it becomes the job of the algorithm to pick which one is "the" poem. The criteria is always:
// longest word count, longest character count, random.

export class Poem {
    // The tiles tracked by the current poem
    tiles: PoemTiles = [];

    constructor(private board: WordTileBoard) {
        this.board = board;
    }

    has(tile: WordTile | string): boolean {
        return typeof tile === "string"
            ? this.tiles.some(t => t.word == tile)
            : this.tiles.some(t => t === tile);
    }

    // Three different possibilities after a tile is dropped:

    // - We don't have a poem, in which case we have to see if there is one.
    // - We have a poem, and a word was either removed, splitting the poem in
    //   half, or moved, requiring a recalculation of the wording.
    // - The tile was added to the existing poem,

    findWordClusters(): WordTile[][] {
        let tiles = [...this.board.getCurrentTiles()];
        const clusters: WordTile[][] = [];

        while (tiles.length > 0) {
            const first = tiles.pop();
            if (first === undefined) {
                throw new Error("CANTHAPPEN: tiles.pop() is undefined after length check?");
            }

            let cluster: WordTile[] = [first];
            let i = 0;

            // For the current tile, find all the tiles in collision with it, and add them to the
            // current cluster. The cluster is completely analyzed when no more tiles can be found
            // in collision with members of the cluster.
            while (i < cluster.length) {
                const currentTile = cluster[i];
                if (!currentTile) {
                    console.warn("CANTHAPPEN: Cluster overrun in findWordCluster");
                    i += 1;
                    break;
                }

                // Append to the cluster all the tiles that are NOT the current tile (it's already
                // here) but are in collision with it.
                cluster = [
                    ...cluster,
                    ...tiles.filter(
                        tile => tile.collides(currentTile) && !cluster.includes(tile)
                    ),
                ];
                i += 1;
            }

            // When the cluster is complete, store it, then remove all the tiles found in that
            // collection from the global collection.
            clusters.push(cluster);
            tiles = tiles.filter(tile => !cluster.includes(tile));
        }
        return clusters;
    }

    check(tile: WordTile) {
        if (this.tiles.length === 1) {
            throw new Error(
                `There's no such thing as a poem of one tile: ${this.tiles[0].word}`
            );
        }

        if (this.tiles.length < 1) {
            this.checkForNewPoem(tile);
            return;
        }

        if (this.has(tile)) {
            this.checkWordRemoved(tile);
            return;
        }

        this.checkForExtendedPoem(tile);
        return;
    }

    checkForNewPoem(tile: WordTile): Poem {
        if (this.tiles.length >= 2) {
            throw new Error("Do not call checkForNewPoem on a working poem.");
        }

        const cluster = this.findWordClusters().find(cluster => cluster.includes(tile));
        if (cluster !== undefined && cluster.length > 1) {
            this.tiles = cluster;
            return this;
        }

        this.tiles = [];
        return this;
    }

    checkWordRemoved(tile: WordTile): Poem {
        if (this.tiles.length < 2) {
            throw new Error("Do not call checkWordRemoved on an empty poem.");
        }

        // If the tile was part of the poem but was moved; after this, it's still part of the poem,
        // so we just trigger a "find the poem's words."
        const stillInPoem = this.tiles.find(t => tile.collides(t));
        if (stillInPoem) {
            return this;
        }

        // Three possibilities:
        // - The tile was moved to create a new, valid cluster, which becomes the new poem.

        const clusters = this.findWordClusters();
        const maybe = clusters.find(cluster => cluster.includes(tile));
        if (maybe && maybe.length > 1) {
            this.tiles = maybe;
            return this;
        }

        // - The tile moved does not create a new cluster, so now we have to scan the
        //   existing clusters for the one with the *most* members of the previous cluster,
        //   and that becomes the new poem.

        type Count = [number, WordTile[]];
        const counts: Count[] = clusters.map(cluster => [
            cluster.filter(c => this.tiles.includes(c)).length,
            cluster,
        ]);
        counts.sort((a, b) => a[0] - b[0]);
        const first = counts.pop();
        if (first && first[1].length > 1) {
            this.tiles = first[1];
            return this;
        }

        // - The tile moved does not create a new cluster and the existing cluster ceases
        //   to exist, so there is no poem.
        this.tiles = [];
        return this;
    }

    checkForExtendedPoem(tile: WordTile): Poem {
        const collider = this.tiles.find(t => t !== tile && tile.collides(t));
        if (collider) {
            this.tiles = [...this.tiles, tile];
        }
        return this;
    }

    getBoundingBox(): Box | null {
        if (this.tiles.length < 2) {
            return null;
        }

        const [ulx, uly, lrx, lry]: Box = this.tiles.reduce(
            ([ulx, uly, lrx, lry], tile) => {
                const [culx, culy, clrx, clry] = tile.boundingBox;
                return [
                    culx < ulx ? culx : ulx,
                    culy < uly ? culy : uly,
                    clrx > lrx ? clrx : lrx,
                    clry > lry ? clry : lry,
                ];
            },
            this.tiles[0].boundingBox
        );

        return [ulx, uly, lrx, lry];
    }

    get poem(): string[] {
        if (this.tiles.length < 2) {
            return [];
        }

        const newBB = this.getBoundingBox();
        if (!newBB) {
            throw new Error("Tiles but no bounding box? CANTHAPPEN");
        }

        // A new array, with references to the existing tiles.
        let tiles = [...this.tiles];
        const averageHeight =
            tiles.reduce((acc, tile) => acc + tile.getSize().height, 0) / tiles.length;
        let zone = newBB[1] + averageHeight * 0.75;
        const ret: string[][] = [];

        while (zone < newBB[3] + averageHeight && tiles.length > 0) {
            const zoneTiles = tiles.filter(t => t.getPos().top <= zone);
            zoneTiles.sort((tileA, tileB) => tileA.getPos().left - tileB.getPos().left);
            ret.push(zoneTiles.map(t => t.word));

            tiles = tiles.filter(t => !zoneTiles.includes(t));
            zone += averageHeight;
        }
        return ret.map(line => line.join(" "));
    }
}
