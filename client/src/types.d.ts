declare module "random-words" {
    export interface Options {
        min?: number;
        max?: number;
        maxLength?: number;
        exactly?: number;
        join?: string;
        wordsPerString?: number;
        separator?: string;
        formatter?: (word: string, index: number) => string;
    }

    export default function randomWords(options?: Options): string | string[];
}
