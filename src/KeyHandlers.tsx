import { TableContainer, TableContainerTypeMap } from "@material-ui/core";
import type { DefaultComponentProps } from "@material-ui/core/OverridableComponent";
import React, { useContext, useRef } from "react";
import { DataContext, EditingContext, ID_BASE, SelectedContext, SetDataContext, SetEditingContext, SetSelectedContext, TableIdContext, useEnterEditing, useExitEditing } from "./state";

type TableContainerProps = DefaultComponentProps<TableContainerTypeMap<{}, "div">>;

export default function KeyHandlers(props: TableContainerProps) {
    const selected = useContext(SelectedContext);
    const setSelected = useContext(SetSelectedContext);
    const data = useContext(DataContext);
    const setData = useContext(SetDataContext);
    const editing = useContext(EditingContext);
    const setEditing = useContext(SetEditingContext);
    const enterEditing = useEnterEditing();
    const exitEditing = useExitEditing();
    const tableId = useContext(TableIdContext);

    const tableContainerRef = useRef<HTMLDivElement>(null);

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
        // Don't handle key presses that occur when the user is using the rowadder
        if(document.activeElement && document.activeElement === document.getElementById(`${ID_BASE}-${tableId}-rowadder`)?.children[0].children[0]) return;
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

    return (
        <TableContainer ref={tableContainerRef} {...props} onKeyDown={handleKeyPress}/>
    )
}