# Better React Spreadsheet

A better spreadsheet widget for React (currently in active development, but probably stable enough to use)

Project goals:
- [x] ⚡ Fully virtualized (rows and columns)
- [x] ⌨️ Same key shortcuts as industry standard spreadsheet software (Google Docs, Excel, etc)
- [x] 🏢 Modern architecture (React function components)
- [ ] 📊 Easy dataset creation and editing
    - [x] Selection of multiple cells
    - [x] Insert rows
    - [ ] Insert columns
    - [ ] Drag-to-autocomplete like in a spreadsheet
    - [ ] Copy, cut, paste (for single cells or multiple cells)
    - [ ] Paste data from other spreadsheet programs
- [x] 📁 Internally and externally, data is just a 2D array, so interop with file formats like CSV is really easy

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

If you have data where different rows have different numbers of cells, you'll need to pass it to `normalizeRows` first:

```js
const newData = normalizeRows(data, /* minWidth */ 20, /* minHeight */ 20);
```

This will also make sure that the array is at least 20 columns by 20 rows by adding empty cells to any row that is less than the minimum, and adding empty rows until the number of rows is equal to the minimum specified. If you don't want any minimum width or height, just set both to 0.

Be warned that `normalizeRows` mutates the data array that is passed to it as a parameter. If you do not want this behavior, use the `cloneDataArray` function:

```js
const newData = normalizeRows(cloneDataArray(data), 20, 20);
```

### Props
- `data: string[][]`: Source for data, formatted as a 2D array of strings
- `onChange(newData: string[][]): void`: Function to call to update `data` array
- `className?: string`: Optional class name to apply to the outermost `div` element of the spreadsheet

### Working with CSVs

To load a CSV, use the `parseCSV` function (a wrapper around [Papa Parse](https://www.papaparse.com/)):
```js
const parseResult = parseCSV(csv);
if(parseResult.errors.length > 0) {
    // Handle errors
}
const data = normalizeRows(parseResult.data, 20, 20);
```

You can also convert a data array back to a CSV string:
```js
const csv = dataToCSV(data, /* trim */ true);
```

If the `trim` parameter is set to `true`, all empty cells at the end of each row will be removed in the resulting CSV.

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

## Development
We use TSDX for scaffolding the library. For information about how to get started, check out [the TSDX default README](README.tsdx.md).

TLDR: run `yarn start` in one terminal, then run `yarn storybook` to run Storybook (although just running `yarn storybook` has worked fine for me).

## Showcase

- [Kobra](https://kobra.dev) (integrated into the dataset manager):
  ![Screenshot of edit dataset dialog in Kobra, powered by Better React Spreadsheet](/assets/showcase-kobra.png)

If you develop (or know of) a project using Better React Spreadsheet, feel free to submit an issue or PR and we'll add you to this section.