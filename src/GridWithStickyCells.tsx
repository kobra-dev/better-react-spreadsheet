import React, { ForwardRefRenderFunction } from "react";
import { FixedSizeGrid, FixedSizeGrid as Grid, FixedSizeGridProps } from "react-window";
import DragIndicator from "./DragIndicator";

function getCellIndices(child: any) {
    return { row: child.props.rowIndex, column: child.props.columnIndex };
}

function getShownIndices(children: React.ReactNode) {
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minColumn = Infinity;
    let maxColumn = -Infinity;

    React.Children.forEach(children, (child) => {
        const { row, column } = getCellIndices(child);
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minColumn = Math.min(minColumn, column);
        maxColumn = Math.max(maxColumn, column);
    });

    return {
        from: {
            row: minRow,
            column: minColumn
        },
        to: {
            row: maxRow,
            column: maxColumn
        }
    };
}

function useInnerElementType(Cell: any, columnWidth: number, rowHeight: number, data: number) {
    return React.useMemo(
        () =>
            React.forwardRef((props, ref) => {
                const sumWidthOrHeight = (index: number, multiplier: number) => Math.max(0, (index - 1) * multiplier);

                const shownIndices = getShownIndices(props.children);

                const children = React.Children.map(props.children, (child) => {
                    const { column, row } = getCellIndices(child);

                    // do not show non-sticky cell
                    if (column === 0 || row === 0) {
                        return null;
                    }

                    return child;
                });

                // @ts-ignore
                children.push(
                    React.createElement(Cell, {
                        key: "0:0",
                        rowIndex: 0,
                        columnIndex: 0,
                        style: {
                            display: "inline-flex",
                            width: columnWidth,
                            height: rowHeight,
                            position: "sticky",
                            top: 0,
                            left: 0,
                            zIndex: 100000
                        }
                    })
                );

                const shownColumnsCount =
                    shownIndices.to.column - shownIndices.from.column;

                for (let i = 1; i <= shownColumnsCount; i += 1) {
                    const columnIndex = i + shownIndices.from.column;
                    const rowIndex = 0;
                    const marginLeft =
                        i === 1 ? sumWidthOrHeight(columnIndex, columnWidth) : undefined;

                    // @ts-ignore
                    children.push(
                        React.createElement(Cell, {
                            key: `${rowIndex}:${columnIndex}`,
                            rowIndex,
                            columnIndex,
                            style: {
                                marginLeft,
                                display: "inline-flex",
                                justifyContent: "center",
                                width: columnWidth,
                                height: rowHeight,
                                position: "sticky",
                                top: 0,
                                zIndex: 99999
                            }
                        })
                    );
                }

                const shownRowsCount =
                    shownIndices.to.row - shownIndices.from.row;

                for (let i = 1; i <= shownRowsCount; i += 1) {
                    const columnIndex = 0;
                    const rowIndex = i + shownIndices.from.row;
                    const marginTop =
                        i === 1 ? sumWidthOrHeight(rowIndex, rowHeight) : undefined;

                    // @ts-ignore
                    children.push(
                        React.createElement(Cell, {
                            key: `${rowIndex}:${columnIndex}`,
                            rowIndex,
                            columnIndex,
                            style: {
                                marginTop,
                                ...(rowIndex === data + 1 ? {
                                    width: "max-content"
                                } : {
                                    rowHeight,
                                    columnWidth,
                                    justifyContent: "center",
                                    maxWidth: columnWidth + "px"    
                                }),
                                position: "sticky",
                                left: 0,
                                zIndex: 99998,
                                display: "flex"
                            },
                            data
                        })
                    );
                }

                return (
                    //@ts-ignore
                    <div ref={ref} {...props}>
                        {children}
                        <DragIndicator />
                    </div>
                );
            }),
        [Cell, columnWidth, rowHeight, data]
    );
}

const GridWithStickyCellsForwardRef: ForwardRefRenderFunction<FixedSizeGrid, FixedSizeGridProps> = (props, ref) => (
    <Grid
        ref={ref}
        {...props}
        innerElementType={useInnerElementType(
            props.children,
            props.columnWidth,
            props.rowHeight,
            props.itemData
        )}
    />
);

export const GridWithStickyCells = React.forwardRef(GridWithStickyCellsForwardRef);