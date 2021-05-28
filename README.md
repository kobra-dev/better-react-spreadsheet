# Better React Spreadsheet

This is a work in progress spreadsheet component for React. 

Project goals:
- ⚡ Fully virtualized (rows and columns)
- ⌨️ Same key shortcuts as industry standard spreadsheet software (Google Docs, Excel, etc)
- 🏢 Modern architecture (React function components)
- 📊 Easy dataset creation and editing (selection of multiple cells, insert rows/columns, drag-to-autocomplete like in a spreadsheet)
- 📁 Internally and externally, data is just a 2D array, so interop with file formats like CSV is really easy

This is still in its early stages, and isn't ready to use in production. 

# Snowpack info

> ✨ Bootstrapped with Create Snowpack App (CSA).

## Available Scripts

### npm start

Runs the app in the development mode.
Open http://localhost:8080 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### npm run build

Builds a static copy of your site to the `build/` folder.
Your app is ready to be deployed!

**For the best production performance:** Add a build bundler plugin like "@snowpack/plugin-webpack" to your `snowpack.config.js` config file.

### npm test

Launches the application test runner.
Run with the `--watch` flag (`npm test -- --watch`) to run in interactive watch mode.
