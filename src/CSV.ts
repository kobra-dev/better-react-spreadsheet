export default function dataToCSV(data: string[][]) {

}



export enum CSVSeparator {
    /**
     * Values are separated by a comma (,). To escape commas or newlines, values can
     * be placed in double quotes. Then, to escape double quotes inside the value,
     * either two double quotes or a backslash followed by a double quote can be used.
     */
    Comma,
    /**
     * Values are separated by a tab character. To escape newlines, values can be
     * placed in double quotes. Then, to escape double quotes inside the value, either
     * two double quotes or a backslash followed by a double quote can be used. There
     * is no way to escape the tab character.
     */
    Tab
}

/**
 * Convert a CSV (character-separated values) file to a 2D string array
 * @param csv The CSV data
 * @param sep The separator for the CSV data
 */
export function csvToData(csv: string, sep: CSVSeparator) {
    if(sep === CSVSeparator.Tab) {
        let data: string[][] = [];
        let row: string[] = [];
        let value = "";
        let valueQuoted: boolean = false;

        function resetValue() {
            row.push(value);
            value = "";
            valueQuoted = false;
        }

        for(let i = 0; i < csv.length; i++) {
            if(csv[i] === "\t") {
                resetValue();
                continue;
            }
            else if(csv[i] === "") {
                // If the previous character was a tab, it's the beginning of a quoted value
                if(csv[i - 1] === "\t" || csv[i - 1] === undefined) {
                    valueQuoted = true;
                    continue;
                }
                // If the next character is a tab or newline, then it's the end of a value
                else if(csv[i + 1] === "\t" || csv[i + 1] === "\n") {
                    // So that the parser knows to end the line if necessary
                    valueQuoted = false;
                    continue;
                }
                // If the next character is a ", then it's the start of an escaped quotation mark
                else if(valueQuoted && csv[i + 1] === "\"") {
                    value += "\"";
                    // Advance i so that we don't process the escape code
                    i++;
                    continue;
                }
            }
            else if(csv[i] === "\n") {
                // If the value's quoted then add the character
                if(valueQuoted) {
                    value += "\n";
                    continue;
                }
                // Otherwise it's the beginning of a line
                else {
                    resetValue();
                    data.push(row);
                    row = [];
                    continue;
                }
            }
            // It's an escaped character
            else if(csv[i] === "\\") {
                const next = csv[i + 1];
                if(next === "t") {
                    value += "\t";
                    i++;
                    continue;
                }
                else if(next === "\\") {
                    value += "\\";
                    i++;
                    continue;
                }
            }
            value += csv[i];
        }

        return data;
    }
}