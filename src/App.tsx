import React, { useRef, useState } from "react";
import {
    Button,
    createMuiTheme,
    makeStyles,
    ThemeProvider
} from "@material-ui/core";
import Spreadsheet from "./Spreadsheet";
import { dataToCSV, normalizeRows, parseCSV } from "./utils";

const getMuiTheme = (isDark: boolean) =>
    createMuiTheme({
        palette: {
            type: isDark ? "dark" : "light",
            primary: { main: "#42ad66", contrastText: "#ffffff" },
            secondary: { main: "#76e094", contrastText: "#000000" }
        }
    });

const useStyles = makeStyles((theme) => ({
    spreadsheet: {
        height: "300px",
        width: "600px"
    }
}));

export default function App() {
    const styles = useStyles();
    const [data, setData] = useState(() =>
        normalizeRows([], 20, 20)
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const [csv, setCsv] = useState("");

    function loadFile() {
        const file = inputRef.current?.files?.[0];
        if (!file) return;
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            const content = fileReader.result;
            if (typeof content === "string") {
                setData(normalizeRows(parseCSV(content).data, 20, 20));
            }
        };

        fileReader.readAsText(file);
    }

    return (
        <div className="App">
            <ThemeProvider theme={getMuiTheme(false)}>
                <input type="file" ref={inputRef} />
                <Button onClick={loadFile}>Load file</Button>
                <Spreadsheet
                    className={styles.spreadsheet}
                    data={data}
                    onChange={setData}
                />
                <Button onClick={() => setCsv(dataToCSV(data, true))}>
                    Export CSV
                </Button>
                <code><pre>{csv}</pre></code>
            </ThemeProvider>
        </div>
    );
}
