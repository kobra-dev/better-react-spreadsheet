import React, { useContext } from "react";
import { createState, createEvent, useRerender } from "niue";
import { CELL_UNIT_WIDTH } from "./Cell";
import type {
    Coords,
    Editing
} from "./Spreadsheet";

const niueStore = createState<{
    selected: Coords,
    editing: Editing | undefined,
    editorValue: string
    dragSelection: DragSelection,
    isDragging: boolean,
    copySelection: DragSelection,
    dataRerender: boolean
}>({
    selected: [0, 0],
    editing: undefined,
    editorValue: "",
    dragSelection: undefined,
    isDragging: false,
    copySelection: undefined,
    dataRerender: false
});

export const useStore = niueStore[0];
export const setState = niueStore[1];

export type Data = string[][];

// Always use useData so that components will rerender when dataHasChanged in the useSetData hook is called
export const _DONT_USE_DIRECTLY_DataContext = React.createContext<Data>([]);

const [useOnDataRerender, emitDataRerender] = createEvent<void>();

export function useData() {
    const rerender = useRerender();
    useOnDataRerender(() => {
        rerender();
    }, []);
    return useContext(_DONT_USE_DIRECTLY_DataContext);
}

const setDataEvent = createEvent<Data>();

export const useOnSetData = setDataEvent[0];

export function useSetData() {
    return {
        setData: setDataEvent[1],
        // React can't detect changes to the contents of the data array, so call dataHasChanged after you're done to avoid slicing the array, editing it, then calling setData
        dataHasChanged: () => emitDataRerender()
    };
}

export const TableIdContext = React.createContext<number>(0);
export type DragSelection = [Coords, Coords] | undefined;

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
    const { selected } = useStore(["selected"]);
    const data = useData();
    const getCellId = useGetCellId();

    return (newValue?: string) => {
        // Edit current cell, this is a bit different than
        // how it is done when the cell is double-clicked
        // because we don't have access to the event handler
        setState({ editorValue: newValue ?? data[selected[0]][selected[1]], editing: {
            c: selected,
            w:
                document.getElementById(getCellId(...selected))?.offsetWidth ??
                CELL_UNIT_WIDTH
        } });
    };
}

export function useExitEditing() {
    const { editing, selected, editorValue } = useStore(["editing", "selected", "editorValue"]);
    const data = useData();
    const { dataHasChanged } = useSetData();

    return () => {
        if(!editing) return;
        data[selected[0]][selected[1]] = editorValue;
        dataHasChanged();
        setState({ editing: undefined });
    };
}