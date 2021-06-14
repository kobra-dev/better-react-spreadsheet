import React from "react";
import { Meta, Story } from "@storybook/react";
import Spreadsheet, { normalizeRows, SpreadsheetProps } from "../src";
import { useState } from "@storybook/client-api";
import { makeStyles } from "@material-ui/core";

interface SpreadsheetStoryProps {
    width: number;
    height: number;
}

const meta: Meta = {
    title: "Spreadsheet",
    component: Spreadsheet,
    argTypes: {
        width: {
            type: {
                name: "number",
                required: true
            },
            defaultValue: 600
        },
        height: {
            type: {
                name: "number",
                required: true
            },
            defaultValue: 300
        }
    },
    parameters: {
        controls: { expanded: true }
    }
};

export default meta;

const useStyles = makeStyles((_theme) => ({
    spreadsheet: (props: SpreadsheetStoryProps) => ({
        width: props.width,
        height: props.height
    })
}));

const Template: Story<SpreadsheetStoryProps> = (args) => {
    const styles = useStyles(args);
    const [data, setData] = useState(() => normalizeRows([], 20, 20));

    return (
        <Spreadsheet className={styles.spreadsheet} data={data} onChange={setData} {...args} />
    );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
