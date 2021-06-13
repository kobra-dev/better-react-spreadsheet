import { Table, makeStyles } from "@material-ui/core";
import type { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { GridWithStickyCells } from "./GridWithStickyCells";
import {
    DataContext,
    EditingContext,
    EditorValueContext,
    getCellIdTableId,
    ID_BASE,
    SelectedContext,
    SetDataContext,
    SetEditingContext,
    SetEditorValueContext,
    SetSelectedContext,
    StateProvider,
    TableIdContext
} from "./state";
import KeyHandlers from "./KeyHandlers";
import CellRenderer, { CELL_UNIT_HEIGHT, CELL_UNIT_WIDTH, HEADER_CELL_BG } from "./Cell";
import { isFullyVisible } from "./utils";

const useStyles = makeStyles((theme) => ({
    spreadsheet: {
        margin: "1rem"
    },
    h100: {
        height: "100%"
    },
    grid: {
        backgroundColor: HEADER_CELL_BG
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

    const styles = useStyles();

    const setSelected = useCallback(
        (c: Coords) => {
            setSelected_state(c);

            //#region Scrolling
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

                /*container.scrollTo({
                    top: (
                        element.offsetTop 
                    ),
                    left: (
                        
                    )
                })*/

                //const sL = container.scrollLeft;
                //const sT = container.scrollTop;
                // Need to scroll to the element to be able to see it
                /*windowRef.current?.scrollToItem({
                    // Not sure why the addition is necessary but it is
                    rowIndex: c[0] + (selected[0] < c[0] ? 1 : 0) + (isLastRow ? 1 : 0),
                    columnIndex: c[1] + (selected[1] < c[1] ? 1 : 0)
                });*/

                // There's a weird glitch where using scrollToItem with an item in the last column or row won't
                // account for the scrollbar width/height, which is odd since the demo does seem to account for it.
                // So, we have to use the DOM's scrollIntoView function to make sure the element is fully visible.
                // However, we need to wait until react-window does its scrolling.

                /*window.requestAnimationFrame(() => {
                    // TODO
                    setTimeout(() => {
                    // If element was null we need to refetch it
                    const newElement = element ?? getElement();
                    if(!newElement) throw new Error("Selected cell still doesn't exist on page");
                    if(!isFullyVisible(container, newElement)) newElement.scrollIntoView();
                    }, 500);
                });*/
            }
            
            // TODO
            /*const isLastCol = c[1] === props.data[0].length - 1;
            if(isLastRow || isLastCol) {

                // Run code after the react-window scroll occurs
                window.requestAnimationFrame(() => {
                    element?.scrollIntoViewIfNeeded();
                })                
            }*/
            //#endregion
        },
        [setSelected_state, windowRef, selected]
    );

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
