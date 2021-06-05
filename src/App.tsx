import React, { useState } from "react";
import { createMuiTheme, makeStyles, ThemeProvider } from "@material-ui/core";
import Spreadsheet from "./Spreadsheet";

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
        Array.from({ length: 100 }, (_, i) =>
            Array.from({ length: 100 }, (_, i) => i.toString())
        )
    );
    return (
        <div className="App">
            <ThemeProvider theme={getMuiTheme(false)}>
                <Spreadsheet className={styles.spreadsheet} data={data} onChange={setData} />
            </ThemeProvider>
        </div>
    );
}
