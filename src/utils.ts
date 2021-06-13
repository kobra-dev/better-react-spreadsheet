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

/**
 * Parse and normalize a CSV file to load into the spreadsheet component
 * @param csv The text of a CSV file to parse
 * @param minWidth The minimum number of columns to display in the spreadsheet
 * @param minHeight The minimum number of rows to display in the spreadsheet
 * @returns A Papa Parse results object with the data (to pass into the spreadsheet component) and errors encountered while parsing
 */
export function normalizeCSV(csv: string, minWidth: number, minHeight: number) {
    const result = Papa.parse<string[]>(csv);
    
    // The spreadsheet requires that all rows have the same number of cells
    // Find the longest row
    let max = 0;
    for(const row of result.data) {
        if(row.length > max) max = row.length;
    }

    max = Math.max(max, minWidth);
    // Make all rows the same length
    for(const row of result.data) {
        for(let i = row.length; i < max; i++) {
            row.push("");
        }
    }

    for(let i = result.data.length; i < minHeight; i++) {
        result.data.push(Array(max).fill(""));
    }

    return result;
}