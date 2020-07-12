export default function lastItem<T>(arr: T[]): T {
    const length = arr.length;
    return arr[length - 1];
}
