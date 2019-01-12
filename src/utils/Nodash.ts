export namespace Nodash {
    export function flatten(arrayOfArray: string[][]): string[] {
        const result: string[] = [];

        arrayOfArray.forEach(arr => {
            arr.forEach(value => result.push(value));
        });

        return result;
    }
}
