import { makeStyles } from "@material-ui/core";
import React from "react";
import { indicatorStyles } from "./DragIndicator";
import { DragSelection, useStore } from "./state";

const strokePlaceholder = "STROKE";

const rotatingDashedBorderSVG = encodeURIComponent(`<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
<style>
    rect {
        animation: stroke 5s infinite linear;
    }
    @keyframes stroke {
        to {
            stroke-dashoffset: 104;
        }
    }
</style>
<rect width='100%' height='100%' fill='none' stroke='${strokePlaceholder}' stroke-width='4' stroke-dasharray='6, 7' stroke-linecap='square' />
</svg>`
// Remove some of the unnecessary whitespace, it won't remove it all but it is not a big deal
    .replace("\n", ""));

const useStyles = makeStyles((theme) => ({
    root: (props: { copySelection: DragSelection }) =>
        props.copySelection ? {
            ...indicatorStyles(props.copySelection),
            backgroundImage: `url("data:image/svg+xml,${rotatingDashedBorderSVG.replace(strokePlaceholder, theme.palette.primary.main.replace("#", "%23"))}")`
        } : {}
}));

export default function CopyIndicator() {
    const { copySelection } = useStore(["copySelection"]);
    const styles = useStyles({ copySelection });

    return copySelection ? <div className={styles.root} /> : null;
}