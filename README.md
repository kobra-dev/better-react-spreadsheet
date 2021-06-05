# Better React Spreadsheet

A better spreadsheet widget for React (currently in active development)

Project goals:
[x] ⚡ Fully virtualized (rows and columns)
[x] ⌨️ Same key shortcuts as industry standard spreadsheet software (Google Docs, Excel, etc)
[x] 🏢 Modern architecture (React function components)
[ ] 📊 Easy dataset creation and editing (selection of multiple cells, insert rows/columns, drag-to-autocomplete like in a spreadsheet)
[x] 📁 Internally and externally, data is just a 2D array, so interop with file formats like CSV is really easy

## Usage

```tsx
import React, { useState } from "react";
import Spreadsheet from "@kobra-dev/better-react-spreadsheet";

function MyComponent() {
    const [data, setData] = useState([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15]
    ]);

    return (
        <Spreadsheet data={data} onChange={setData}/>
    );
}
```

### Props
- `data: string[][]`: Source for data, formatted as a 2D array of strings
- `onChange(newData: string[][]): void`: Function to call to update `data` array
- `className?: string`: Optional class name to apply to the outermost `div` element of the spreadsheet

### Customizing theme
Better React Spreadsheet uses Material-UI internally, so you can use a `ThemeProvider` to change the color scheme of the table (for example, to add dark mode):

```tsx
import { createMuiTheme, ThemeProvider } from "@material-ui/core";


// Kobra's MUI theme
const getMuiTheme = (isDark: boolean) =>
    createMuiTheme({
        palette: {
            type: isDark ? "dark" : "light",
            primary: { main: "#42ad66", contrastText: "#ffffff" },
            secondary: { main: "#76e094", contrastText: "#000000" }
        }
    });

export default function App() {
    const isDark = /* get dark theme status */;

    return (
        <ThemeProvider theme={getMuiTheme(isDark)}>
            {/* the rest of your app */}
        </ThemeProvider>
    );
}
```

## Showcase

We're currently working on integrating Better React Spreadsheet into [Kobra](https://kobra.dev); we'll update this page when that's complete. If you develop (or know of) a project using Better React Spreadsheet, feel free to submit an issue or PR and we'll add you to this section.