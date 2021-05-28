import React from "react";
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
        height: "400px",
        width: "600px"
    }
}));

export default function App() {
    const styles = useStyles();
    return (
        <div className="App">
            <ThemeProvider theme={getMuiTheme(false)}>
                <Spreadsheet className={styles.spreadsheet} w={100} h={100} />
            </ThemeProvider>
        </div>
    );
}
