import { makeStyles } from "@material-ui/core";
import type { CSSProperties } from "@material-ui/core/styles/withStyles";
import React from "react";
import { CELL_UNIT_HEIGHT, CELL_UNIT_WIDTH } from "./Cell";
import type { Coords } from "./Spreadsheet";
import { DragSelection, useStore } from "./state";

export const indicatorStyles: {(selection: [Coords, Coords]): CSSProperties} = (selection) => ({
    position: "absolute",
    left: (selection[0][1] + 1) * CELL_UNIT_WIDTH,
    top: (selection[0][0] + 1) * CELL_UNIT_HEIGHT,
    width:
        (selection[1][1] -
            selection[0][1] +
            1) *
        CELL_UNIT_WIDTH 
        // Add 1 to cover the left border of the next cell
        + 1,
    height:
        (selection[1][0] -
            selection[0][0] +
            1) *
        CELL_UNIT_HEIGHT,
    zIndex: 99990,
    pointerEvents: "none",
    boxSizing: "border-box"
});

const useStyles = makeStyles(theme => ({
    root: (props: { dragSelection: DragSelection }) =>
        props.dragSelection
            ? {
                ...indicatorStyles(props.dragSelection),
                  backgroundColor: theme.palette.primary.light,
                  opacity: 0.2
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
    const { dragSelection } = useStore(["dragSelection"]);
    const styles = useStyles({
        dragSelection: dragSelection && dragSelectionToRect(dragSelection)
    });

    return dragSelection ? <div className={styles.root} /> : null;
}
