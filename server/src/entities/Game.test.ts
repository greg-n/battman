import Game, { GameState } from "./Game";
import Player, { PlayerState } from "./Player";

describe("Game", () => {
    // TODO ensure that return values are as expected, usefull
    it("Can operate a game through properly", () => {
        const game = new Game("Steve");
        expect(game.state).toBe(GameState.waitingRoom);

        // Add "Steve", set word, ready up
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

        game.start("Steve");
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

    it("Allows guess out on partial", () => {
        const game = new Game("Steve");
        expect(game.state).toBe(GameState.waitingRoom);

        // Add "Steve", set word, ready up
        game.setWord("Steve", "bbbbb");
        game.readyUpToggle("Steve");

        // Add "Will", set word, ready up
        game.addPlayer("Will");
        game.setWord("Will", "llll");
        game.readyUpToggle("Will");

        game.start("Steve");
        expect(game.state).toBe(GameState.running);

        const steveItem = game.players.get("Steve") as Player;
        const willItem = game.players.get("Will") as Player;
        const actor = game.currentPlayer as string;
        const actorItem = actor === "Will" ? willItem : steveItem;
        const subject = actor === "Will" ? "Steve" : "Will";
        const subjectItem = actor === "Will" ? steveItem : willItem;
        const guess = actor === "Will" ? "b" : "l";
        game.guess(actor, subject, guess);

        expect(game.state).toBe(GameState.ended);
        expect(subjectItem.state).toBe(PlayerState.eliminated);
        expect(actorItem.state).toBe(PlayerState.victor);
    });

    it("Allows a player to disconnect", () => {
        const game = new Game("Steve");
        expect(game.state).toBe(GameState.waitingRoom);

        // Add "Steve", set word, ready up
        game.setWord("Steve", "book");
        game.readyUpToggle("Steve");

        // Add "Will", set word, ready up
        game.addPlayer("Will");
        game.setWord("Will", "tests");
        game.readyUpToggle("Will");

        game.addPlayer("Jeff");
        game.setWord("Jeff", "tests");
        game.readyUpToggle("Jeff");

        game.disconnectPlayer("Jeff");
        expect(game.players.has("Jeff")).toBeFalsy();

        game.addPlayer("Mark");
        game.setWord("Mark", "tests");
        game.readyUpToggle("Mark");

        game.start("Steve");
        expect(game.state).toBe(GameState.running);

        game.disconnectPlayer("Mark");
        expect(game.players.has("Mark")).toBeTruthy();
        const markItem = game.players.get("Mark") as Player;
        expect(markItem.guessedWordPortion === markItem.word).toBeTruthy();
        expect(markItem.state === PlayerState.disconnected).toBeTruthy();
    });

    it("Allows marshall change constraints/transfer, requiring ready", () => {
        expect.assertions(8);

        const game = new Game("Steve");
        expect(game.state).toBe(GameState.waitingRoom);

        // Add "Steve", set word, ready up
        game.setWord("Steve", "book");
        game.readyUpToggle("Steve");

        // Add "Will", set word, ready up
        game.addPlayer("Will");
        game.setWord("Will", "tests");
        game.readyUpToggle("Will");

        game.transferMarshallShip("Steve", "Will");
        game.changeWordConstraints("Will", 1, 4);

        const willItem = game.players.get("Will") as Player;
        expect(willItem.state).toBe(PlayerState.joined);
        expect(willItem.word).toBe(null);
        expect(willItem.guessedWordPortion).toBe(null);

        try {
            game.start("Steve");
        } catch (error) {
            expect(error.message).toBe("Must be waiting room marshall to begin the game.");
        }
        try {
            game.start("Will");
        } catch (error) {
            expect(error.message).toBe("Players Will are not ready to play.");
        }
        try {
            game.readyUpToggle("Will");
        } catch (error) {
            expect(error.message).toBe("Player must have set a word to ready up.");
        }
        game.setWord("Will", "tests");
        game.readyUpToggle("Will");

        game.start("Will");
        expect(game.state).toBe(GameState.running);
    });

    describe("Game rules", () => {
        test("Can't guess that same person three times in a row", () => {
            expect.assertions(3);

            const game = new Game("Steve");
            expect(game.state).toBe(GameState.waitingRoom);

            // Add "Steve", set word, ready up
            game.setWord("Steve", "book");
            game.readyUpToggle("Steve");

            // Add "Will", set word, ready up
            game.addPlayer("Will");
            game.setWord("Will", "tests");
            game.readyUpToggle("Will");

            game.addPlayer("Jeff");
            game.setWord("Jeff", "tests");
            game.readyUpToggle("Jeff");

            game.addPlayer("Mark");
            game.setWord("Mark", "tests");
            game.readyUpToggle("Mark");

            game.start("Steve");
            expect(game.state).toBe(GameState.running);

            // Partial guess
            const guess = "t";
            for (let i = 0; i < 13; i++) {
                const subject = game.nextPlayer();
                const actor = game.currentPlayer as string;
                try {
                    game.guess(actor, subject, guess);
                } catch (error) {
                    expect(error.message).toBe(
                        "Can't guess the same person 3 times in a row unless <= 3 remaining players."
                    );
                }
            }
        });
    });
});
