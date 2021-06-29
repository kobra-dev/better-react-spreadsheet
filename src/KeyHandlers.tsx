import { TableContainer, TableContainerTypeMap } from "@material-ui/core";
import type { DefaultComponentProps } from "@material-ui/core/OverridableComponent";
import React, { useContext, useRef } from "react";
import { dragSelectionToRect } from "./DragIndicator";
import { DataContext, DragSelectionContext, EditingContext, ID_BASE, SelectedContext, SetDataContext, SetDragSelectionContext, SetEditingContext, SetSelectedContext, TableIdContext, useEnterEditing, useExitEditing } from "./state";

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
    const dragSelection = useContext(DragSelectionContext);
    const setDragSelection = useContext(SetDragSelectionContext);

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
        let clearDragSelection = false;

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
                    clearDragSelection = true;
                    break;
                }
                // TODO: accessibility
                case "Tab": {
                    if (e.shiftKey) {
                        arrowLeft();
                    } else {
                        arrowRight();
                    }
                    clearDragSelection = true;
                    break;
                }
                case "Delete":
                case "Backspace": {
                    // New object so React knows to rerender the component
                    const newData = data.slice();
                    if(dragSelection) {
                        const rect = dragSelectionToRect(dragSelection);
                        for(let row = rect[0][0]; row <= rect[1][0]; row++) {
                            for(let col = rect[0][1]; col <= rect[1][1]; col++) {
                                newData[row][col] = "";
                            }
                        }
                    }
                    else {
                        newData[selected[0]][selected[1]] = "";
                    }
                    setData(newData);
                    break;
                }
                case "ArrowLeft": {
                    if(e.shiftKey) {
                        if(!dragSelection && selected[1] > 0) {
                            setDragSelection([selected, [selected[0], selected[1] - 1]]);
                        }
                        else if(dragSelection && dragSelection[1][1] > 0) {
                            setDragSelection([dragSelection[0], [dragSelection[1][0], dragSelection[1][1] - 1]]);
                        }
                    }
                    else {
                        arrowLeft();
                        clearDragSelection = true;
                    }
                    break;
                }
                case "ArrowRight": {
                    if(e.shiftKey) {
                        if(!dragSelection && selected[1] < data[0].length - 1) {
                            setDragSelection([selected, [selected[0], selected[1] + 1]]);
                        }
                        else if(dragSelection && dragSelection[1][1] < data[0].length - 1) {
                            setDragSelection([dragSelection[0], [dragSelection[1][0], dragSelection[1][1] + 1]]);
                        }
                    }
                    else {
                        arrowRight();
                        clearDragSelection = true;    
                    }
                    break;
                }
                case "ArrowUp": {
                    if(e.shiftKey) {
                        if(!dragSelection && selected[0] > 0) {
                            setDragSelection([selected, [selected[0] - 1, selected[1]]]);
                        }
                        else if(dragSelection && dragSelection[1][0] > 0) {
                            setDragSelection([dragSelection[0], [dragSelection[1][0] - 1, dragSelection[1][1]]]);
                        }
                    }
                    else {
                        if (selected[0] > 0) {
                            setSelected([selected[0] - 1, selected[1]]);
                        }
                        clearDragSelection = true;
                    }
                    break;
                }
                case "ArrowDown": {
                    if(e.shiftKey) {
                        if(!dragSelection && selected[0] < data.length - 1) {
                            setDragSelection([selected, [selected[0] + 1, selected[1]]]);
                        }
                        else if(dragSelection && dragSelection[1][0] < data.length - 1) {
                            setDragSelection([dragSelection[0], [dragSelection[1][0] + 1, dragSelection[1][1]]]);
                        }
                    }
                    else {
                        arrowDown();
                        clearDragSelection = true;    
                    }
                    break;
                }
                default: {
                    preventDefault = false;
                    if (e.key.length === 1) {
                        // It's probably a letter key
                        enterEditing("");
                        clearDragSelection = true;
                    }
                    break;
                }
            }
        }

        if (preventDefault) {
            e.preventDefault();
        }
        if(clearDragSelection) {
            setDragSelection(undefined);
        }
    }

    return (
        <TableContainer ref={tableContainerRef} {...props} onKeyDown={handleKeyPress}/>
    )
}