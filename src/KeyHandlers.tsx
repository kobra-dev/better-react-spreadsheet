import { TableContainer, TableContainerTypeMap } from "@material-ui/core";
import type { DefaultComponentProps } from "@material-ui/core/OverridableComponent";
import React, { useContext, useRef } from "react";
import Papa from "papaparse";
import { dragSelectionToRect } from "./DragIndicator";
import { Data, DataContext, DragSelectionContext, EditingContext, ID_BASE, SelectedContext, SetDataContext, SetDragSelectionContext, SetEditingContext, SetSelectedContext, TableIdContext, useEnterEditing, useExitEditing } from "./state";

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

    // Separate functions so they can be called from multiple key press handlers
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

    const backspace = () => {
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
    };

    const getCopyData = () => {
        let copyData: Data;
        if(dragSelection) {
            const rect = dragSelectionToRect(dragSelection);
            copyData = data.slice(rect[0][0], rect[1][0] + 1).map(row => row.slice(rect[0][1], rect[1][1] + 1));
        }
        else {
            copyData = [[ data[selected[0]][selected[1]] ]];
        }

        return Papa.unparse(copyData, { delimiter: "\t" });
    };

    async function handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
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
                    backspace();
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
                    if (e.key.length === 1 && !e.ctrlKey) {
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

    const isFocused = tableContainerRef.current === document.activeElement || tableContainerRef.current?.contains(document.activeElement);

    const onCopy = (e: React.ClipboardEvent) => {
        if(!editing && isFocused) {
            e.preventDefault();
            e.stopPropagation();

            e.clipboardData?.setData("text/plain", getCopyData());
            // TODO: indicator around copied cells
        }
    };

    const onCut = (e: React.ClipboardEvent) => {
        if(!editing && isFocused) {
            e.preventDefault();
            e.stopPropagation();
            
            // Cutting is just copying then clearing the selected cells
            e.clipboardData?.setData("text/plain", getCopyData());
            backspace();
        }
    };

    const onPaste = (e: React.ClipboardEvent) => {
        if(!editing && isFocused) {
            e.preventDefault();
            e.stopPropagation();

            const clipboardText = e.clipboardData?.getData("text");
            // It seems like all the major spreadsheet software uses a tab as a delimiter for copy and pasting data
            const parsed = Papa.parse<string[]>(clipboardText, { delimiter: "\t" });
            let pasteData: Data = parsed.data;

            let newData = data.slice();

            // Make sure there's enough rows and columns
            const newRows = selected[0] + pasteData.length;
            if(newRows > newData.length) {
                for(let i = newData.length; i < newRows; i++) {
                    newData.push(Array(newData[0].length).fill(""));
                }
            }
            const newCols = selected[1] + Math.max(...pasteData.map(row => row.length));
            if(newCols > newData[0].length) {
                for(const row of newData) {
                    for(let i = row.length; i < newCols; i++) {
                        row.push("");
                    }
                }
            }

            for(let row = 0; row < pasteData.length; row++) {
                for(let col = 0; col < pasteData[row].length; col++) {
                    newData[selected[0] + row][selected[1] + col] = pasteData[row][col];
                }
            }

            setData(newData);
        }
    };

    return (
        <TableContainer ref={tableContainerRef} {...props} onKeyDown={handleKeyPress} onCopy={onCopy} onCut={onCut} onPaste={onPaste} />
    )
}