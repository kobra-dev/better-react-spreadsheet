import { InputBase, makeStyles, TableCell, Theme } from "@material-ui/core";
import React, { CSSProperties, useContext } from "react";
import {
    EditingContext,
    EditorValueContext,
    SelectedContext,
    SetEditorValueContext,
    SetSelectedContext,
    useEnterEditing,
    useExitEditing,
    useGetCellId
} from "./state";
import {
    cellStyles,
    ZERO_WIDTH_SPACE,
    CELL_UNIT_WIDTH,
    CELL_UNIT_HEIGHT
} from "./Cell";

const useStyles = makeStyles((theme) => ({
    cell: cellStyles,
    selectedCell: {
        // Hopefully no one is using this with 9999 columns
        // For some reason TypeScript hates this being a string so I have to do this
        "z-index": "9999 !important"
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
    cellEditor: {
        "z-index": "10001 !important"
    }
}));

const shiftEC = (style: CSSProperties) => ({
    ...style,
    left: Number(style.left) + 0.5
});

const useEditorStyles = makeStyles<Theme, { editingWidth: number }>(
    (theme) => ({
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
        })
    })
);

// Separate function to only call useContext when necessary
function CellEditor(props: { style: CSSProperties }) {
    const styles = useStyles();
    const editorValue = useContext(EditorValueContext);
    const setEditorValue = useContext(SetEditorValueContext);
    const editing = useContext(EditingContext);
    const editorStyles = useEditorStyles({ editingWidth: editing?.w ?? 0 });

    return (
        <td
            className={
                styles.cellEditor +
                " " +
                styles.cell +
                " " +
                styles.selectedCell
            }
            style={props.style}
        >
            <InputBase
                className={editorStyles.cellEditorInput}
                value={editorValue}
                onChange={(e) => {
                    setEditorValue(e.target.value);
                }}
                autoFocus
            />
        </td>
    );
}

export default function DataCellRenderer(props: {
    style: CSSProperties;
    item: string;
    row: number;
    col: number;
    isScrolling: boolean;
}) {
    const { style, item, row, col, isScrolling } = props;
    const styles = useStyles();
    const enterEditing = useEnterEditing();
    const exitEditing = useExitEditing();
    const editing = useContext(EditingContext);
    const selected = useContext(SelectedContext);
    const setSelected = useContext(SetSelectedContext);
    const getCellId = useGetCellId();

    const thisIs = (a: number[] | undefined) =>
        a && a[0] === row && a[1] === col;
    const isSelected = thisIs(selected);
    const isEditing = thisIs(editing?.c);

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
                      exitEditing();
                      setSelected([row, col]);
                      break;
                  }
                  case 2: {
                      enterEditing();
                  }
              }
          };

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
                            (isEditing ? " " + styles.editingEventCatcher : "")
                        }
                        style={shiftEC(style)}
                        onClick={isEditing ? undefined : cellClickHandler}
                    />
                )
            }
            {!isScrolling && isEditing ? (
                <CellEditor style={style} />
            ) : (
                <>
                    <TableCell
                        className={
                            styles.cell +
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
                              ZERO_WIDTH_SPACE
                            : item}
                    </TableCell>
                </>
            )}
        </React.Fragment>
    );
}
