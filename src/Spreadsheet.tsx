import { Table, makeStyles } from "@material-ui/core";
import type { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { GridWithStickyCells } from "./GridWithStickyCells";
import {
    CopySelectionContext,
    _DONT_USE_DIRECTLY_DataContext,
    DataRerenderContext,
    DragSelection,
    DragSelectionContext,
    EditingContext,
    EditorValueContext,
    getCellIdTableId,
    ID_BASE,
    IsDraggingContext,
    SelectedContext,
    SetCopySelectionContext,
    SetDataContext,
    SetDataRerenderContext,
    SetDragSelectionContext,
    SetEditingContext,
    SetEditorValueContext,
    SetIsDraggingContext,
    SetSelectedContext,
    StateProvider,
    TableIdContext
} from "./state";
import KeyHandlers from "./KeyHandlers";
import CellRenderer, { CELL_UNIT_HEIGHT, CELL_UNIT_WIDTH, HEADER_CELL_BG } from "./Cell";
import { isFullyVisible } from "./utils";

const useStyles = makeStyles((theme) => ({
    spreadsheet: {
        // From Material-UI
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    h100: {
        height: "100%"
    },
    grid: {
        backgroundColor: HEADER_CELL_BG(theme)
    }
}));

export type Coords = [number, number];
export type Editing = { c: Coords; w: number };

if (!globalThis._better_react_spreadsheet_counter) {
    globalThis._better_react_spreadsheet_counter = 0;
}

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
    const [dragSelection, setDragSelection] = useState<DragSelection>(undefined);
    const [isDragging, setIsDragging] = useState(false);
    const [copySelection, setCopySelection] = useState<DragSelection>(undefined);
    const [dataRerender, setDataRerender] = useState(false);

    const styles = useStyles();

    const scrollTo = (c: Coords) => {
        const getElement = () => document.getElementById(isLastRow ? `${ID_BASE}-${tableId}-rowadder` : getCellIdTableId(tableId, ...c));
        const isLastRow = c[0] === props.data.length - 1;
        const element = getElement();
        const container = document.getElementById(`${ID_BASE}-${tableId}`)?.children[0].children[0];
        if(!container) throw new Error("Container is undefined");        
        if(!element || !isFullyVisible(container, element)) {
            // Above and Below also mean Left and Right
            enum VisibilityStatus {
                Above,
                Below,
                Visible
            }

            const rowY = CELL_UNIT_HEIGHT * (c[0] + 1 + (isLastRow ? 1 : 0));
            const rowIsVisible: VisibilityStatus = rowY < container.scrollTop + CELL_UNIT_HEIGHT ? VisibilityStatus.Above
                : rowY > container.scrollTop + container.clientHeight - CELL_UNIT_HEIGHT ? VisibilityStatus.Below
                : VisibilityStatus.Visible;

            const colX = CELL_UNIT_WIDTH * (c[1] + 1);
            const colIsVisible: VisibilityStatus = colX < container.scrollLeft + CELL_UNIT_WIDTH ? VisibilityStatus.Above
                : colX > container.scrollLeft + container.clientWidth - CELL_UNIT_WIDTH ? VisibilityStatus.Below
                : VisibilityStatus.Visible;
            
            const scrollToOptions: ScrollToOptions = {
                top: rowIsVisible === VisibilityStatus.Above ? rowY - CELL_UNIT_HEIGHT
                    : rowIsVisible === VisibilityStatus.Below ? rowY - container.clientHeight + CELL_UNIT_HEIGHT
                    : container.scrollTop,
                left: colIsVisible === VisibilityStatus.Above ? colX - CELL_UNIT_WIDTH
                    : colIsVisible === VisibilityStatus.Below ? colX - container.clientWidth + CELL_UNIT_WIDTH
                    : container.scrollLeft,
                behavior: "auto"
            };
            
            container.scrollTo(scrollToOptions);
        }
    }

    const setSelected = useCallback(
        (c: Coords) => {
            setSelected_state(c);
            scrollTo(c);
        },
        [setSelected_state, windowRef, selected]
    );

    useEffect(() => {
        if(dragSelection)
            scrollTo(dragSelection[1]);
    }, [dragSelection?.[1][0], dragSelection?.[1][1]]);

    return (
        <StateProvider
            contexts={[
                [_DONT_USE_DIRECTLY_DataContext, props.data],
                [SetDataContext, props.onChange],
                [SelectedContext, selected],
                [SetSelectedContext, setSelected],
                [EditingContext, editing],
                [SetEditingContext, setEditing],
                [EditorValueContext, editorValue],
                [SetEditorValueContext, setEditorValue],
                [TableIdContext, tableId],
                [DragSelectionContext, dragSelection],
                [SetDragSelectionContext, setDragSelection],
                [IsDraggingContext, isDragging],
                [SetIsDraggingContext, setIsDragging],
                [CopySelectionContext, copySelection],
                [SetCopySelectionContext, setCopySelection],
                [DataRerenderContext, dataRerender],
                [SetDataRerenderContext, setDataRerender]
            ]}
        >
            <KeyHandlers
                className={
                    styles.spreadsheet +
                    (props.className && " " + props.className)
                }
                tabIndex={0}
            >
                <Table className={styles.h100} id={`${ID_BASE}-${tableId}`}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <GridWithStickyCells
                                ref={windowRef}
                                className={styles.grid}
                                height={height}
                                rowCount={props.data.length + 2}
                                columnCount={props.data[0].length + 1}
                                rowHeight={28}
                                columnWidth={CELL_UNIT_WIDTH}
                                width={width}
                                itemData={props.data.length}
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
