import {
    Table,
    TableBody,
    TableContainer,
    TableCell,
    makeStyles,
    InputBase,
    Theme
} from "@material-ui/core";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import React, {
    useState,
    useRef,
    CSSProperties,
} from "react";
import { GridWithStickyCells } from "./GridWithStickyCells";

const CELL_BORDER_COLOR = "rgb(231, 231, 231)";

const CELL_UNIT_WIDTH = 74;
const CELL_UNIT_HEIGHT = 28;

const useStyles = makeStyles<Theme, { editingWidth: number }>((theme) => ({
    cell: {
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
    },
    selectedCell: {
        // Hopefully no one is using this with 9999 columns
        // For some reason TypeScript hates this being a string so I have to do this
        "z-index": "9999 !important"
    },
    headerCell: {
        textAlign: "center",
        backgroundColor: "#dedede",
        cursor: "initial"
    },
    selectedHeaderCell: {
        backgroundColor: "#cacaca"
    },
    eventCatcher: {
        "z-index": "10000 !important",
        maxWidth: "inherit !important",
        width: CELL_UNIT_WIDTH + "px",
        height: CELL_UNIT_HEIGHT + "px",
        backgroundColor: "rgba(0,0,0,0)",
        cursor: "cell"
    },
    selectedEventCatcher: {
        outline: "2px solid " + theme.palette.primary.main,
        outlineOffset: "-2px"
    },
    editingEventCatcher: {
        "z-index": "10002 !important",
        pointerEvents: "none"
    },
    eventCatcherCell: {
        pointerEvents: "none"
    },
    headerRow: {
        height: "29px"
    },
    cellEditor: {
        "z-index": "10001 !important"
    },
    cellEditorInput: (props) => ({
        backgroundColor: "white",
        padding: "3px 0",
        height: "0px",
        width: props.editingWidth - 9 + "px",
        "& > *": {
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: "0.875rem"
        }
    }),
    spreadsheet: {
        margin: "1rem"
    },
    tableBody: {
        display: "block"
    },
    h100: {
        height: "100%"
    }
}));

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const numberToAlphabet = (i: number) =>
    ALPHABET[i % ALPHABET.length].repeat(((i / 26) >> 0) + 1);

type Coords = [number, number];

if (!globalThis._better_react_spreadsheet_counter) {
    globalThis._better_react_spreadsheet_counter = 0;
}

export default function Spreadsheet(props: {
    className?: string;
    w: number;
    h: number;
}) {
    const [data, setData] = useState(() =>
        Array.from({ length: props.h }, (_, i) =>
            Array.from({ length: props.w }, (_, i) => i.toString())
        )
    );
    const [tableId] = useState(() => {
        globalThis._better_react_spreadsheet_counter++;
        return globalThis._better_react_spreadsheet_counter;
    });
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState<Coords>([0, 0]);
    const [editing, setEditing] =
        useState<{ c: Coords; w: number } | undefined>(undefined);
    const [editorValue, setEditorValue] = useState("");

    const styles = useStyles({ editingWidth: editing?.w ?? 0 });

    const getCellId = (row: number, col: number) =>
        `better-react-spreadsheet-${tableId}-${row}-${col}`;

    const processVirtualStyles = (
        style: CSSProperties,
        row?: number,
        col?: number
    ) => {
        const newStyle = Object.fromEntries(
            Object.entries(style).filter(
                ([key]) => key !== "width" && key !== "height"
            )
        );

        if (row && col) {
            const indexFromEnd = data[0].length - col - 1;
            if (selected[0] === row && selected[1] === col) {
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
        }

        return newStyle;
    };

    const shiftEC = (style: CSSProperties) => ({
        ...style,
        left: Number(style.left) + 0.5
    });

    const headerCell = (selected: boolean) =>
        styles.headerCell +
        " " +
        styles.cell +
        " " +
        styles.virtualizedCell +
        (selected ? " " + styles.selectedHeaderCell : "");

    const exitEditing = () => {
        data[selected[0]][selected[1]] = editorValue;
        setData(data);
        setEditing(undefined);
    };

    const enterEditing = (newValue?: string) => {
        // Edit current cell, this is a bit different than
        // how it is done when the cell is double-clicked
        // because we don't have access to the event handler
        setEditorValue(newValue ?? data[selected[0]][selected[1]]);
        setEditing({
            c: selected,
            w:
                document.getElementById(getCellId(...selected))?.offsetWidth ??
                CELL_UNIT_WIDTH
        });
    };

    // Separate functions so they can be called when enter or tab is pressed
    const arrowDown = () => {
        if (selected[0] < data.length - 1) {
            setSelected([selected[0] + 1, selected[1]]);
        }
    };

    const arrowLeft = () => {
        if (selected[1] > 0) {
            setSelected([selected[0], selected[1] - 1]);
        }
    };

    const arrowRight = () => {
        if (selected[1] < data[0].length - 1) {
            setSelected([selected[0], selected[1] + 1]);
        }
    };

    function handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
        let preventDefault = true;

        if (editing) {
            switch (e.key) {
                case "Enter": {
                    exitEditing();
                    arrowDown();
                    tableContainerRef.current?.focus();
                    break;
                }
                case "Tab": {
                    exitEditing();
                    if (e.shiftKey) {
                        arrowLeft();
                    } else {
                        arrowRight();
                    }
                    tableContainerRef.current?.focus();
                    break;
                }
                case "Escape": {
                    // Don't save the new value
                    setEditing(undefined);
                    tableContainerRef.current?.focus();
                    break;
                }
                default: {
                    preventDefault = false;
                }
            }
        } else {
            switch (e.key) {
                case "Enter": {
                    enterEditing();
                    break;
                }
                // TODO: accessibility
                case "Tab": {
                    if (e.shiftKey) {
                        arrowLeft();
                    } else {
                        arrowRight();
                    }
                    break;
                }
                case "Delete":
                case "Backspace": {
                    // New object so React knows to rerender the component
                    const newData = data.slice();
                    newData[selected[0]][selected[1]] = "";
                    setData(newData);
                    break;
                }
                case "ArrowLeft": {
                    arrowLeft();
                    break;
                }
                case "ArrowRight": {
                    arrowRight();
                    break;
                }
                case "ArrowUp": {
                    if (selected[0] > 0) {
                        setSelected([selected[0] - 1, selected[1]]);
                    }
                    break;
                }
                case "ArrowDown": {
                    arrowDown();
                    break;
                }
                default: {
                    preventDefault = false;
                    if (e.key.length === 1) {
                        // It's probably a letter key
                        enterEditing("");
                    }
                    break;
                }
            }
        }

        if (preventDefault) {
            e.preventDefault();
        }
    }

    const DataCellRenderer = ({
        style,
        item,
        row,
        col,
        isScrolling
    }: {
        style: CSSProperties;
        item: string;
        row: number;
        col: number;
        isScrolling: boolean;
    }) => {
        const thisIs = (a: number[] | undefined) =>
            a && a[0] === row && a[1] === col;

        const cellClickHandler = isScrolling
            ? undefined
            : (
                  e: React.MouseEvent<
                      | HTMLDivElement
                      | HTMLTableHeaderCellElement
                      | HTMLTableDataCellElement,
                      globalThis.MouseEvent
                  >
              ) => {
                  // e.detail is the number of clicks (2 is double click)
                  switch (e.detail) {
                      case 1: {
                          if (editing) {
                              exitEditing();
                          }
                          setSelected([row, col]);
                          break;
                      }
                      case 2: {
                          enterEditing();
                      }
                  }
              };

        const isSelected = thisIs(selected);
        const isEditing = thisIs(editing?.c);
        const useEventCatcher = !isScrolling || isSelected;

        return (
            <React.Fragment key={row + "," + col}>
                {
                    // Event catcher so that you can click on cells underneath the current cell if it is overflowing
                    // Also provides the outline around the cell
                    useEventCatcher && (
                        <div
                            className={
                                styles.eventCatcher +
                                (isSelected
                                    ? " " + styles.selectedEventCatcher
                                    : "") +
                                (isEditing
                                    ? " " + styles.editingEventCatcher
                                    : "")
                            }
                            style={shiftEC(style)}
                            onClick={isEditing ? undefined : cellClickHandler}
                        />
                    )
                }
                {!isScrolling && isEditing ? (
                    <td
                        className={
                            styles.cellEditor +
                            " " +
                            styles.cell +
                            " " +
                            styles.virtualizedCell +
                            " " +
                            styles.selectedCell
                        }
                        style={style}
                    >
                        <InputBase
                            className={styles.cellEditorInput}
                            value={editorValue}
                            onChange={(e) => {
                                setEditorValue(e.target.value);
                            }}
                            autoFocus
                        />
                    </td>
                ) : (
                    <>
                        <TableCell
                            className={
                                styles.cell +
                                " " +
                                styles.virtualizedCell +
                                " " +
                                (isSelected ? " " + styles.selectedCell : "") +
                                (useEventCatcher
                                    ? " " + styles.eventCatcherCell
                                    : "")
                            }
                            style={style}
                            id={getCellId(row, col)}
                            onClick={isSelected ? undefined : cellClickHandler}
                        >
                            {item === ""
                                ? // Zero-width space to make sure the cell height is correct
                                  "​"
                                : item}
                        </TableCell>
                    </>
                )}
            </React.Fragment>
        );
    };

    const cellRenderer = ({
        columnIndex,
        rowIndex,
        style,
        isScrolling
    }: GridChildComponentProps<string[][]>) =>
        rowIndex === 0 ? (
            columnIndex === 0 ? (
                <TableCell
                    style={processVirtualStyles(style)}
                    className={headerCell(false)}
                />
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
            <DataCellRenderer
                style={processVirtualStyles(
                    style,
                    rowIndex - 1,
                    columnIndex - 1
                )}
                item={data[rowIndex - 1][columnIndex - 1]}
                row={rowIndex - 1}
                col={columnIndex - 1}
                isScrolling={isScrolling ?? false}
            />
        );

    return (
        <TableContainer
            className={
                styles.spreadsheet + (props.className && " " + props.className)
            }
            onKeyDown={handleKeyPress}
            tabIndex={0}
            ref={tableContainerRef}
        >
            <Table className={styles.h100}>
                <AutoSizer>
                    {({ height, width }) => (
                        <GridWithStickyCells
                            height={300}
                            rowCount={data.length + 1}
                            columnCount={data[0].length + 1}
                            rowHeight={28}
                            columnWidth={CELL_UNIT_WIDTH}
                            width={width}
                            useIsScrolling
                        >
                            {cellRenderer}
                        </GridWithStickyCells>
                    )}
                </AutoSizer>
                <TableBody
                    className={styles.h100 + " " + styles.tableBody}
                ></TableBody>
            </Table>
        </TableContainer>
    );
}
