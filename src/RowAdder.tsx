import { Button, InputBase, makeStyles } from "@material-ui/core";
import React, { CSSProperties, useContext, useState } from "react";
import { CELL_UNIT_HEIGHT, CELL_BORDER_COLOR } from "./Cell";
import { DataContext, ID_BASE, SetDataContext, TableIdContext } from "./state";

const useStyles = makeStyles((theme) => ({
    wrapper: {
        height: CELL_UNIT_HEIGHT,
        alignItems: "center",
        padding: "0 0.25rem",
        border: "1px solid " + CELL_BORDER_COLOR(theme),
        boxSizing: "border-box",
        color: theme.palette.text.primary
    },
    input: {
        maxWidth: "4rem",
        border: "1px solid " + CELL_BORDER_COLOR(theme),
        "& > input": {
            padding: 0
        }
    },
    button: {
        height: "calc(100% - 0.25rem)",
        marginLeft: "0.5rem",
        width: "5rem"
    }
}));

export default function RowAdder(props: { style: CSSProperties }) {
    const styles = useStyles();
    const [fieldValue, setFieldValue] = useState("10");
    const data = useContext(DataContext);
    const setData = useContext(SetDataContext);
    const tableId = useContext(TableIdContext);

    function addRows() {
        setData([
            ...data,
            // TODO: use Array.fill, it's much faster
            ...Array.from({ length: parseInt(fieldValue) }, () =>
                Array.from({ length: data[0].length }, () => "")
            )
        ]);
    }

    return (
        <div style={props.style} className={styles.wrapper} key="rowadder" id={`${ID_BASE}-${tableId}-rowadder`}>
            Add&nbsp;
            <InputBase
                className={styles.input}
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                type="number"
                inputProps={{
                    min: 1
                }}
            />
            &nbsp;rows at bottom
            <Button
                className={styles.button}
                variant="outlined"
                size="small"
                onClick={addRows}
            >
                Go
            </Button>
        </div>
    );
}
