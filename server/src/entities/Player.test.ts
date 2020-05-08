import Player, { PlayerState } from "./Player";
import cloneDeep from "lodash.clonedeep";

describe("Player", () => {
    it("Creates as expected", () => {
        const steve = new Player("Steve");
        expect(steve.name).toBe("Steve");
        expect(steve.word).toBe(null);
        expect(steve.guessedWordPortion).toBe(null);
        expect(steve.guessedLetters).toStrictEqual(new Set());
        expect(steve.guessedWords).toStrictEqual(new Set());
        expect(steve.eliminatedPlayers).toStrictEqual(new Set());
        expect(steve.state).toBe(PlayerState.joined);
        expect(steve.lastGuessedAgainst).toStrictEqual([]);
        expect(steve.lastGuessedBy).toStrictEqual([]);
    });

    it("Can create a serializable version", () => {
        const steve = new Player("Steve");
        const serializable = steve.getSafeToSerialize();
        expect(
            JSON.parse(JSON.stringify(serializable))
        ).toStrictEqual(serializable);
    });

    it("Can produce sanitized version", () => {
        const steve = new Player("Steve");
        steve.word = "test";
        steve.guessedWordPortion = "____";

        const copySteve = cloneDeep(steve);
        delete copySteve.word;

        expect(steve.getSanitizedCopy()).toStrictEqual(copySteve);

        const will = new Player("Will");
        will.word = "test";
        will.guessedWordPortion = "____";
        will.state = PlayerState.eliminated;

        expect(will.getSanitizedCopy()).toStrictEqual(will);
    });
});
