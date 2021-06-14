import React from 'react';
import * as ReactDOM from 'react-dom';
import { Default as Spreadsheet } from '../stories/Spreadsheet.stories';

describe('Spreadsheet', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    // TODO
    ReactDOM.render(<Spreadsheet />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
