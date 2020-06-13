// Returned updated and amount added
export default function fillInChars(
    actual: string,
    current: string,
    char: string
): [string, number] {
    let copy = "";
    let amountFilled = 0;
    for (let i = 0; i < current.length; i++) {
        if (actual[i] === char) {
            copy += char;
            amountFilled++;
        } else {
            copy += current[i];
        }
    }

    return [copy, amountFilled];
}
