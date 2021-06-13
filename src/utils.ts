import { CELL_UNIT_HEIGHT, CELL_UNIT_WIDTH } from "./Cell";
import Papa from "papaparse";

// Based on https://stackoverflow.com/a/41698614
// Check if an element is fully visible
export function isFullyVisible(container: Element, elem: HTMLElement) {
    const bcr = elem.getBoundingClientRect();
    return elem.offsetTop >= container.scrollTop + CELL_UNIT_HEIGHT &&
        elem.offsetLeft >= container.scrollLeft + CELL_UNIT_WIDTH &&
        elem.offsetTop <= container.scrollTop + container.clientHeight - CELL_UNIT_HEIGHT &&
        elem.offsetLeft <= container.scrollLeft + container.clientWidth - bcr.width;
}

export function cloneDataArray(data: string[][]) {
    return data.map(row => row.slice());
}

/**
 * Normalize a data array to load into the spreadsheet component
 * @param data A data array to normalize
 * @param minWidth The minimum number of columns to display in the spreadsheet
 * @param minHeight The minimum number of rows to display in the spreadsheet
 * @returns A normalized (all rows are the same length) data array
 */
export function normalizeRows(data: string[][], minWidth: number, minHeight: number) {
    // The spreadsheet requires that all rows have the same number of cells
    // Find the longest row
    let max = 0;
    for(const row of data) {
        if(row.length > max) max = row.length;
    }

    max = Math.max(max, minWidth);
    // Make all rows the same length
    for(const row of data) {
        for(let i = row.length; i < max; i++) {
            row.push("");
        }
    }

    for(let i = data.length; i < minHeight; i++) {
        data.push(Array(max).fill(""));
    }

    return data;
}

/**
 * Parse a CSV file into a data array
 * @param csv The text of a CSV file to parse
 * @returns A Papa Parse results object with the data (to pass into the spreadsheet component) and errors encountered while parsing
 */
export function parseCSV(csv: string) {
    return Papa.parse<string[]>(csv);
}

/**
 * Convert a data array to CSV format
 * @param data A 2D data array to convert to CSV format
 * @param trim If true, remove all empty cells at the end of each row
 */
export function dataToCSV(data: string[][], trim: boolean) {
    const newData = cloneDataArray(data);

    if(trim) {
        for(const row of newData) {
            for(let i = row.length - 1; i >= 0 && row[i].trim().length === 0; i--) {
                row.pop();
            }
        }
    }

    return Papa.unparse(newData);
}