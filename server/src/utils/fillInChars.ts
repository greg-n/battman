// Returned updated if guess added any values
export default function fillInChars(
    actual: string,
    current: string,
    char: string
): string {
    let copy = "";
    for (let i = 0; i < current.length; i++) {
        if (actual[i] === char) {
            copy += char;
        } else {
            copy += current[i];
        }
    }

    return copy;
}
