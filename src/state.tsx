import React, { useContext } from "react";
import { CELL_UNIT_WIDTH } from "./Cell";
import type {
    Coords,
    Editing
} from "./Spreadsheet";

type StateSet<T> = React.Dispatch<React.SetStateAction<T>>;
export type Data = string[][];
const empty = () => {};

// Always use useData so that components will rerender when dataHasChanged in the useSetData hook is called
export const _DONT_USE_DIRECTLY_DataContext = React.createContext<Data>([]);
export const SetDataContext = React.createContext<StateSet<Data>>(empty);
export const DataRerenderContext = React.createContext(false);
export const SetDataRerenderContext = React.createContext<StateSet<boolean>>(empty);

export function useData() {
    useContext(DataRerenderContext);
    return useContext(_DONT_USE_DIRECTLY_DataContext);
}

export function useSetData() {
    const setDataRerender = useContext(SetDataRerenderContext);

    return {
        setData: useContext(SetDataContext),
        // React can't detect changes to the contents of the data array, so call dataHasChanged after you're done to avoid slicing the array, editing it, then calling setData
        dataHasChanged: () => setDataRerender(p => !p)
    };
}

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
export type DragSelection = [Coords, Coords] | undefined;
export const DragSelectionContext = React.createContext<DragSelection>(undefined);
export const SetDragSelectionContext = React.createContext<StateSet<DragSelection>>(empty);
export const IsDraggingContext = React.createContext(false);
export const SetIsDraggingContext = React.createContext<StateSet<boolean>>(empty);
export const CopySelectionContext = React.createContext<DragSelection>(undefined);
export const SetCopySelectionContext = React.createContext<StateSet<DragSelection>>(empty);

type StateProviderItem<T> = [React.Context<T>, T];

// Taken from https://github.com/Merlin04/multipad/blob/main/src/providers/EditorStateProvider.tsx#L50
interface MultipleContextsProps {
    contexts: React.ReactNode[];
    children: React.ReactNode;
}

const MultipleContexts = ({
    contexts, 
    //@ts-ignore
    children 
}: MultipleContextsProps) =>
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

export const ID_BASE = "better-react-spreadsheet";

export const getCellIdTableId = (tableId: number, row: number, col: number) =>
    `${ID_BASE}-${tableId}-${row}-${col}`;

export function useGetCellId() {
    const tableId = useContext(TableIdContext);
    return (row: number, col: number) => getCellIdTableId(tableId, row, col);
}

export function useEnterEditing() {
    const setEditorValue = useContext(SetEditorValueContext);
    const setEditing = useContext(SetEditingContext);
    const data = useData();
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
    const data = useData();
    const selected = useContext(SelectedContext);
    const editorValue = useContext(EditorValueContext);
    const { dataHasChanged } = useSetData();

    return () => {
        if(!editing) return;
        data[selected[0]][selected[1]] = editorValue;
        dataHasChanged();
        setEditing(undefined);
    };
}