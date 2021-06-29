import { makeStyles } from "@material-ui/core";
import React, { useContext } from "react";
import { CELL_UNIT_HEIGHT, CELL_UNIT_WIDTH } from "./Cell";
import type { Coords } from "./Spreadsheet";
import { DragSelection, DragSelectionContext } from "./state";

const useStyles = makeStyles(theme => ({
    root: (props: { dragSelection: DragSelection }) =>
        props.dragSelection
            ? {
                  position: "absolute",
                  left: (props.dragSelection[0][1] + 1) * CELL_UNIT_WIDTH,
                  top: (props.dragSelection[0][0] + 1) * CELL_UNIT_HEIGHT,
                  width:
                      (props.dragSelection[1][1] -
                          props.dragSelection[0][1] +
                          1) *
                      CELL_UNIT_WIDTH,
                  height:
                      (props.dragSelection[1][0] -
                          props.dragSelection[0][0] +
                          1) *
                      CELL_UNIT_HEIGHT,
                  backgroundColor: theme.palette.primary.light,
                  opacity: 0.2,
                  zIndex: 9999999,
                  pointerEvents: "none"
              }
            : {}
}));

export function dragSelectionToRect(ds: [Coords, Coords]): [Coords, Coords] {
    return ([
        [Math.min(ds[0][0], ds[1][0]), Math.min(ds[0][1], ds[1][1])],
        [Math.max(ds[0][0], ds[1][0]), Math.max(ds[0][1], ds[1][1])]
    ]);
}

export default function DragIndicator() {
    const dragSelection = useContext(DragSelectionContext);
    const styles = useStyles({
        dragSelection: dragSelection && dragSelectionToRect(dragSelection)
    });

    return dragSelection ? <div className={styles.root} /> : null;
}
