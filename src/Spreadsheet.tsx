import { Table, makeStyles } from "@material-ui/core";
import type { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GridWithStickyCells } from "./GridWithStickyCells";
import {
    DataContext,
    EditingContext,
    EditorValueContext,
    SelectedContext,
    SetDataContext,
    SetEditingContext,
    SetEditorValueContext,
    SetSelectedContext,
    StateProvider,
    TableIdContext
} from "./state";
import KeyHandlers from "./KeyHandlers";
import CellRenderer, { CELL_UNIT_WIDTH } from "./Cell";

const useStyles = makeStyles((theme) => ({
    spreadsheet: {
        margin: "1rem"
    },
    h100: {
        height: "100%"
    }
}));

export type Coords = [number, number];
export type Editing = { c: Coords; w: number };

if (!globalThis._better_react_spreadsheet_counter) {
    globalThis._better_react_spreadsheet_counter = 0;
}

// TODO: add minwidth and minheight props
export interface SpreadsheetProps {
    data: string[][];
    onChange(data: string[][]): void;
    className?: string;
}

export default function Spreadsheet(props: SpreadsheetProps) {
    const [tableId] = useState(() => {
        globalThis._better_react_spreadsheet_counter++;
        return globalThis._better_react_spreadsheet_counter;
    });
    const windowRef = useRef<FixedSizeGrid<string[][]>>(null);
    const [selected, setSelected_state] = useState<Coords>([0, 0]);
    const [editing, setEditing] = useState<Editing | undefined>(undefined);
    const [editorValue, setEditorValue] = useState("");

    const styles = useStyles();

    const setSelected = useCallback(
        (c: Coords) => {
            setSelected_state(c);
            windowRef.current?.scrollToItem({
                // Not sure why the addition is necessary but it is
                rowIndex: c[0] + (selected[0] < c[0] ? 1 : 0),
                columnIndex: c[1] + (selected[1] < c[1] ? 1 : 0)
            });
        },
        [setSelected_state, windowRef, selected]
    );

    useEffect(() => {
        windowRef.current?.scrollToItem({
            rowIndex: selected[0],
            columnIndex: selected[1]
        });
    }, selected);

    return (
        <StateProvider
            contexts={[
                [DataContext, props.data],
                [SetDataContext, props.onChange],
                [SelectedContext, selected],
                [SetSelectedContext, setSelected],
                [EditingContext, editing],
                [SetEditingContext, setEditing],
                [EditorValueContext, editorValue],
                [SetEditorValueContext, setEditorValue],
                [TableIdContext, tableId]
            ]}
        >
            <KeyHandlers
                className={
                    styles.spreadsheet +
                    (props.className && " " + props.className)
                }
                tabIndex={0}
            >
                <Table className={styles.h100}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <GridWithStickyCells
                                ref={windowRef}
                                height={height}
                                rowCount={props.data.length + 1}
                                // TODO: calculate based on longest row
                                columnCount={props.data[0].length + 1}
                                rowHeight={28}
                                columnWidth={CELL_UNIT_WIDTH}
                                width={width}
                                useIsScrolling
                            >
                                {CellRenderer}
                            </GridWithStickyCells>
                        )}
                    </AutoSizer>
                </Table>
            </KeyHandlers>
        </StateProvider>
    );
}
