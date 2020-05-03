import Game, { GameState } from "./Game";
import Player, { PlayerState } from "./Player";

describe("Game", () => {
    // TODO ensure that return values are as expected, usefull
    it("Can operate a game through properly", () => {
        const game = new Game();
        expect(game.state).toBe(GameState.waitingRoom);

        // Add "Steve", set word, ready up
        game.addPlayer("Steve");
        game.setWord("Steve", "book");
        expect(game.players.get("Steve")).toMatchObject({
            eliminatedPlayers: new Set(),
            guessedLetters: new Set(),
            guessedWordPortion: "____",
            guessedWords: new Set(),
            lastGuessedAgainst: [],
            lastGuessedBy: [],
            name: "Steve",
            state: PlayerState.joined,
            word: "book"
        });
        const steveItem = game.players.get("Steve") as Player;
        game.readyUpToggle("Steve");
        expect(steveItem.state).toBe(PlayerState.ready);

        // Add "Will", set word, ready up
        game.addPlayer("Will");
        game.setWord("Will", "tests");
        expect(game.players.get("Will")).toMatchObject({
            eliminatedPlayers: new Set(),
            guessedLetters: new Set(),
            guessedWordPortion: "_____",
            guessedWords: new Set(),
            lastGuessedAgainst: [],
            lastGuessedBy: [],
            name: "Will",
            state: PlayerState.joined,
            word: "tests"
        });
        const willItem = game.players.get("Will") as Player;
        game.readyUpToggle("Will");
        expect(willItem.state).toBe(PlayerState.ready);

        game.start();
        expect(game.state).toBe(GameState.running);
        expect(steveItem.state).toBe(PlayerState.playing);
        expect(willItem.state).toBe(PlayerState.playing);

        expect(["Will", "Steve"].includes(game.currentPlayer || "None")).toBeTruthy();

        // Partial guess
        let actor = game.currentPlayer as string;
        let actorItem = actor === "Will" ? willItem : steveItem;
        let subject = actor === "Will" ? "Steve" : "Will";
        let subjectItem = actor === "Will" ? steveItem : willItem;

        let guess = actor === "Will" ? "o" : "t";
        game.guess(actor, subject, guess);

        expect(game.state).toBe(GameState.running);
        expect(subjectItem.state).toBe(PlayerState.playing);
        expect(subjectItem.guessedWordPortion).toBe(
            subject === "Will" ? "t__t_" : "_oo_"
        );
        expect(subjectItem.guessedLetters).toStrictEqual(new Set([guess]));
        expect(subjectItem.lastGuessedBy).toStrictEqual([actor]);

        expect(actorItem.state).toBe(PlayerState.playing);
        expect(actorItem.lastGuessedAgainst).toStrictEqual([subject]);

        // Current player should have switched
        expect(game.currentPlayer).toBe(subject);

        // Game ending full word guess
        actor = game.currentPlayer as string;
        actorItem = actor === "Will" ? willItem : steveItem;
        subject = actor === "Will" ? "Steve" : "Will";
        subjectItem = actor === "Will" ? steveItem : willItem;

        guess = actor === "Will" ? "book" : "tests";
        game.guess(actor, subject, guess);

        expect(game.state).toBe(GameState.ended);
        expect(subjectItem.state).toBe(PlayerState.eliminated);
        expect(subjectItem.guessedWordPortion).toBe(subjectItem.word);
        expect(subjectItem.guessedWords).toStrictEqual(new Set([guess]));
        expect(subjectItem.lastGuessedBy).toStrictEqual([actor]);

        expect(actorItem.state).toBe(PlayerState.victor);
        expect(actorItem.lastGuessedAgainst).toStrictEqual([subject]);
    });
});
