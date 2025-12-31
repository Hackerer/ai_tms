import { useState, useEffect, useMemo, type HTMLProps, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type RowSelectionState,
    type OnChangeFn,
    type HeaderContext,
    type CellContext
} from '@tanstack/react-table';
import type { EventChange } from '../types/workflow';
import { cn } from '../lib/utils';

interface EventGridProps {
    data: EventChange[];
    onUpdate: (index: number, field: keyof EventChange, value: any) => void;
    isReadOnly?: boolean;
    rowSelection: RowSelectionState;
    setRowSelection: OnChangeFn<RowSelectionState>;
}

const columnHelper = createColumnHelper<EventChange>();

// --- Helper: Indeterminate Checkbox ---
function IndeterminateCheckbox({
    indeterminate,
    className = '',
    ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && indeterminate;
        }
    }, [ref, indeterminate]);

    return (
        <input
            type="checkbox"
            ref={ref}
            className={cn(
                "cursor-pointer rounded-sm bg-muted/10 border border-border text-primary focus:ring-primary/50 accent-primary w-4 h-4",
                className
            )}
            {...rest}
        />
    );
}

// --- Editable Cell Component ---
const EditableCell = ({
    value: initialValue,
    rowIndex,
    columnId,
    onUpdate,
    isReadOnly,
    className
}: {
    value: string;
    rowIndex: number;
    columnId: string;
    onUpdate: (index: number, field: keyof EventChange, value: any) => void;
    isReadOnly?: boolean;
    className?: string;
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
        if (value !== initialValue) {
            onUpdate(rowIndex, columnId as keyof EventChange, value);
        }
    };

    if (isReadOnly) {
        return <span className={cn("truncate block w-full text-foreground", className)} title={value}>{value || '-'}</span>;
    }

    return (
        <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }
            }}
            className={cn(
                "w-full bg-transparent border-none p-1 -ml-1 rounded focus:outline-none focus:bg-muted/10 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/30 text-foreground",
                className
            )}
            placeholder="-"
        />
    );
};

// ... (skipping IndeterminateCheckbox for now, or including it if I want to update it too)
// Actually I should update IndeterminateCheckbox styles too.
// I'll update the main container first.

export const EventGrid = ({
    data,
    onUpdate,
    isReadOnly = false,
    rowSelection,
    setRowSelection
}: EventGridProps) => {

    // Define columns inside component to access props for selection handlers
    const columns = useMemo(() => [
        {
            id: 'select',
            header: ({ table }: HeaderContext<EventChange, unknown>) => (
                <div className="flex items-center justify-center">
                    <IndeterminateCheckbox
                        {...{
                            checked: table.getIsAllRowsSelected(),
                            indeterminate: table.getIsSomeRowsSelected(),
                            onChange: table.getToggleAllRowsSelectedHandler(),
                            className: "border-border bg-muted/10"
                        }}
                    />
                </div>
            ),
            cell: ({ row }: CellContext<EventChange, unknown>) => (
                <div className="flex items-center justify-center">
                    <IndeterminateCheckbox
                        {...{
                            checked: row.getIsSelected(),
                            disabled: !row.getCanSelect(),
                            indeterminate: row.getIsSomeSelected(),
                            onChange: row.getToggleSelectedHandler(),
                            className: "border-border bg-muted/10"
                        }}
                    />
                </div>
            ),
            size: 40,
        },
        columnHelper.accessor('name', {
            header: '事件名称',
            cell: info => (
                <EditableCell
                    value={info.getValue()}
                    rowIndex={info.row.index}
                    columnId="name"
                    onUpdate={onUpdate}
                    isReadOnly={isReadOnly}
                    className="font-mono text-sm font-bold"
                />
            ),
            size: 200,
        }),
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => <span className="font-mono text-[10px] text-muted-foreground">{info.getValue()}</span>,
            size: 100,
        }),
        columnHelper.accessor('operation', {
            header: '操作类型',
            cell: info => {
                const op = info.getValue() || 'edit';
                const colors = {
                    create: 'bg-green-500/10 text-green-600 border-green-500/20',
                    edit: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                    delete: 'bg-red-500/10 text-red-600 border-red-500/20',
                };
                return (
                    <span className={cn(
                        "px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tighter",
                        colors[op] || colors.edit
                    )}>
                        {op}
                    </span>
                );
            },
            size: 80,
        }),
        columnHelper.accessor('description', {
            header: '描述',
            cell: info => (
                <EditableCell
                    value={info.getValue() || ''}
                    rowIndex={info.row.index}
                    columnId="description"
                    onUpdate={onUpdate}
                    isReadOnly={isReadOnly}
                    className="text-xs text-muted-foreground"
                />
            ),
            size: 300,
        }),
        columnHelper.accessor('parameters', {
            header: '参数量',
            cell: info => (
                <span className="text-[10px] font-mono bg-muted/10 border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                    {(info.getValue() || []).length}
                </span>
            ),
            size: 60,
        }),
    ], [onUpdate, isReadOnly]);

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getRowId: row => row.id, // Use Event ID for selection state
        debugTable: false,
    });

    return (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-border bg-muted/5">
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className={cn(
                                    "group transition-colors",
                                    row.getIsSelected() ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/5"
                                )}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        className="px-4 py-2 overflow-hidden"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                                    暂无数据
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-2 border-t border-border bg-muted/5 text-[10px] text-muted-foreground flex justify-between items-center">
                <span>共 {data.length} 条记录</span>
                <span className="font-mono opacity-50">Row Selection Enabled</span>
            </div>
        </div>
    );
};
