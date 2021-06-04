import { makeStyles, TableCell } from "@material-ui/core";
import type { CSSProperties as MuiCSSProperties } from "@material-ui/styles";
import React, { CSSProperties, useContext, useMemo } from "react";
import type { GridChildComponentProps } from "react-window";
import DataCellRenderer from "./DataCell";
import { DataContext, SelectedContext } from "./state";

const CELL_BORDER_COLOR = "rgb(231, 231, 231)";

export const CELL_UNIT_WIDTH = 74;
export const CELL_UNIT_HEIGHT = 28;

export const cellStyles: MuiCSSProperties = {
    cursor: "cell",
    padding: "0.25rem",
    textAlign: "right",
    userSelect: "none",
    boxSizing: "border-box",
    minWidth: CELL_UNIT_WIDTH + "px",
    height: CELL_UNIT_HEIGHT + "px",
    border: "0.5px solid " + CELL_BORDER_COLOR,
    backgroundColor: "white",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    borderRight: "none",
    borderLeft: "1px solid " + CELL_BORDER_COLOR
};

const useStyles = makeStyles((theme) => ({
    cell: cellStyles,
    headerCell: {
        textAlign: "center",
        backgroundColor: "#dedede",
        cursor: "initial"
    },
    selectedHeaderCell: {
        backgroundColor: "#cacaca"
    },
    headerRow: {
        height: "29px"
    }
}));

export const ZERO_WIDTH_SPACE = "​";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const numberToAlphabet = (i: number) =>
    ALPHABET[i % ALPHABET.length].repeat(((i / 26) >> 0) + 1);

const processVirtualStyles = (style: CSSProperties) =>
    Object.fromEntries(
        Object.entries(style).filter(
            ([key]) => key !== "width" && key !== "height"
        )
    );

export default function CellRenderer({
    columnIndex,
    rowIndex,
    style,
    isScrolling
}: GridChildComponentProps<string[][]>) {
    const selected = useContext(SelectedContext);
    const styles = useStyles();

    const headerCell = (selected: boolean) =>
        styles.headerCell +
        " " +
        styles.cell +
        (selected ? " " + styles.selectedHeaderCell : "");

    return rowIndex === 0 ? (
        columnIndex === 0 ? (
            <TableCell
                style={processVirtualStyles(style)}
                className={headerCell(false)}
                // Fix for weird positioning bug
            >
                {ZERO_WIDTH_SPACE}
            </TableCell>
        ) : (
            <TableCell
                style={processVirtualStyles(style)}
                className={headerCell(selected[1] === columnIndex - 1)}
            >
                {numberToAlphabet(columnIndex - 1)}
            </TableCell>
        )
    ) : columnIndex === 0 ? (
        <TableCell
            style={processVirtualStyles(style)}
            className={headerCell(selected[0] === rowIndex - 1)}
        >
            {rowIndex}
        </TableCell>
    ) : (
        <DataCellWrapper
            style={style}
            row={rowIndex - 1}
            col={columnIndex - 1}
            isScrolling={isScrolling}
        />
    );
}

function DataCellWrapper({
    style,
    row,
    col,
    isScrolling
}: {
    style: CSSProperties;
    row: number;
    col: number;
    isScrolling: boolean | undefined;
}) {
    const data = useContext(DataContext);
    const selected = useContext(SelectedContext);
    const isSelected = selected[0] === row && selected[1] === col;

    const processedStyles = useMemo(() => {
        const newStyle = processVirtualStyles(style);

        const indexFromEnd = data[0].length - col - 1;
        if (isSelected) {
            newStyle.maxWidth = (indexFromEnd + 1) * CELL_UNIT_WIDTH;
        } else {
            // Find the next cell in the row with data
            newStyle.maxWidth = 0;
            let i = col + 1;
            for (; i < data[row].length; i++) {
                if (data[row][i].trim().length > 0) {
                    break;
                }
            }
            newStyle.maxWidth += (i - col) * CELL_UNIT_WIDTH;
        }
        newStyle.zIndex = indexFromEnd;

        return newStyle;
    }, [style, isSelected, [...data[row]]]);

    return (
        <DataCellRenderer
            style={processedStyles}
            item={data[row][col]}
            row={row}
            col={col}
            isScrolling={isScrolling ?? false}
        />
    );
}
