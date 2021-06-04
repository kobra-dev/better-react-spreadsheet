import React, { useContext } from "react";
import { CELL_UNIT_WIDTH } from "./Cell";
import type {
    Coords,
    Editing
} from "./Spreadsheet";

type StateSet<T> = React.Dispatch<React.SetStateAction<T>>;
type Data = string[][];
const empty = () => {};

export const DataContext = React.createContext<Data>([]);
export const SetDataContext = React.createContext<StateSet<Data>>(empty);
export const SelectedContext = React.createContext<Coords>([0, 0]);
export const SetSelectedContext = React.createContext<StateSet<Coords>>(empty);
export const EditingContext =
    React.createContext<Editing | undefined>(undefined);
export const SetEditingContext =
    React.createContext<StateSet<Editing | undefined>>(empty);
export const EditorValueContext = React.createContext("");
export const SetEditorValueContext =
    React.createContext<StateSet<string>>(empty);
export const TableIdContext = React.createContext<number>(0);

type StateProviderItem<T> = [React.Context<T>, T];

// Taken from https://github.com/Merlin04/multipad/blob/main/src/providers/EditorStateProvider.tsx#L50
interface MultipleContextsProps {
    contexts: React.ReactNode[];
    children: React.ReactNode;
}

const MultipleContexts = ({ contexts, children }: MultipleContextsProps) =>
    [
        // @ts-ignore
        { ...contexts[0], props: { ...contexts[0].props, children } },
        ...contexts.slice(1)
    ].reduce((acc, cur) => ({
        ...cur,
        props: { ...cur.props, children: acc }
    }));

export function StateProvider(props: {
    contexts: StateProviderItem<any>[];
    children: React.ReactNode;
}) {
    return (
        <MultipleContexts
            contexts={props.contexts.map(([Context, value]) => (
                <Context.Provider value={value} />
            ))}
        >
            {props.children}
        </MultipleContexts>
    );
}

export const getCellIdTableId = (tableId: number, row: number, col: number) =>
    `better-react-spreadsheet-${tableId}-${row}-${col}`;

export function useGetCellId() {
    const tableId = useContext(TableIdContext);
    return (row: number, col: number) => getCellIdTableId(tableId, row, col);
}

export function useEnterEditing() {
    const setEditorValue = useContext(SetEditorValueContext);
    const setEditing = useContext(SetEditingContext);
    const data = useContext(DataContext);
    const selected = useContext(SelectedContext);
    const getCellId = useGetCellId();

    return (newValue?: string) => {
        // Edit current cell, this is a bit different than
        // how it is done when the cell is double-clicked
        // because we don't have access to the event handler
        setEditorValue(newValue ?? data[selected[0]][selected[1]]);
        setEditing({
            c: selected,
            w:
                document.getElementById(getCellId(...selected))?.offsetWidth ??
                CELL_UNIT_WIDTH
        });
    };
}

export function useExitEditing() {
    const editing = useContext(EditingContext);
    const setEditing = useContext(SetEditingContext);
    const data = useContext(DataContext);
    const selected = useContext(SelectedContext);
    const editorValue = useContext(EditorValueContext);
    const setData = useContext(SetDataContext);

    return () => {
        if(!editing) return;
        data[selected[0]][selected[1]] = editorValue;
        setData(data);
        setEditing(undefined);
    };
}