import { useState, useEffect, useMemo, type HTMLProps, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type RowSelectionState,
    type OnChangeFn,
    type HeaderContext,
    type CellContext,
    type HeaderGroup,
    type Header,
    type Row,
    type Cell
} from '@tanstack/react-table';
import type { EventChange } from '../types/workflow';
import { cn } from '../lib/utils';
import { EventScreenshot } from './EventScreenshot';

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
                "cursor-pointer rounded border border-border bg-muted/10 text-primary focus:ring-primary/50 accent-primary w-3.5 h-3.5 transition-all hover:border-primary/50",
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
        return <span className={cn("truncate block w-full text-foreground/80", className)} title={value}>{value || '-'}</span>;
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
                "w-full bg-transparent border-none p-1 -ml-1 rounded focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/30 text-foreground",
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
                        }}
                    />
                </div>
            ),
            size: 40,
        },
        // 第1列：ID（前置）
        columnHelper.accessor('id', {
            header: 'ID',
            cell: (info: CellContext<EventChange, string>) => (
                <span className="font-mono text-[10px] text-muted-foreground/60">
                    {info.getValue()}
                </span>
            ),
            size: 100,
        }),
        // 第2列：截图
        columnHelper.accessor('screenshot_url', {
            header: '截图',
            cell: (info: CellContext<EventChange, string | undefined>) => (
                <EventScreenshot
                    url={info.getValue() || null}
                    eventId={info.row.original.id}
                    editable={!isReadOnly}
                    onUpload={(url) => onUpdate(info.row.index, 'screenshot_url', url)}
                    onDelete={() => onUpdate(info.row.index, 'screenshot_url', null)}
                />
            ),
            size: 80,
        }),
        // 第3列：Code（替代原名称列）
        columnHelper.accessor('name', {
            header: 'CODE',
            cell: (info: CellContext<EventChange, string>) => (
                <EditableCell
                    value={info.getValue()}
                    rowIndex={info.row.index}
                    columnId="name"
                    onUpdate={onUpdate}
                    isReadOnly={isReadOnly}
                    className="font-mono text-sm font-semibold text-foreground"
                />
            ),
            size: 180,
        }),
        columnHelper.accessor('operation', {
            header: '操作类型',
            cell: (info: CellContext<EventChange, 'create' | 'edit' | 'delete'>) => {
                const op = info.getValue() || 'edit';
                const colors = {
                    create: 'bg-green-500/10 text-green-400 border-green-500/20',
                    edit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    delete: 'bg-red-500/10 text-red-400 border-red-500/20',
                };
                return (
                    <span className={cn(
                        "px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tighter",
                        colors[op as keyof typeof colors] || colors.edit
                    )}>
                        {op}
                    </span>
                );
            },
            size: 80,
        }),
        columnHelper.accessor('description', {
            header: '描述',
            cell: (info: CellContext<EventChange, string | undefined>) => (
                <EditableCell
                    value={info.getValue() || ''}
                    rowIndex={info.row.index}
                    columnId="description"
                    onUpdate={onUpdate}
                    isReadOnly={isReadOnly}
                    className="text-xs text-muted-foreground/80"
                />
            ),
            size: 300,
        }),
        columnHelper.accessor('parameters', {
            header: '参数量',
            cell: (info: CellContext<EventChange, any[]>) => (
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">
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
        getRowId: (row: EventChange) => row.id, // Use Event ID for selection state
        debugTable: false,
    });

    return (
        <div className="card-standard p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup: HeaderGroup<EventChange>) => (
                            <tr key={headerGroup.id} className="border-b border-border/50">
                                {headerGroup.headers.map((header: Header<EventChange, unknown>) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-4 text-label select-none"
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
                    <tbody className="divide-y divide-border/30">
                        {table.getRowModel().rows.map((row: Row<EventChange>) => (
                            <tr
                                key={row.id}
                                className={cn(
                                    "group transition-colors",
                                    row.getIsSelected() ? "bg-blue-500/10 hover:bg-blue-500/15" : "hover:bg-muted/5"
                                )}
                            >
                                {row.getVisibleCells().map((cell: Cell<EventChange, unknown>) => (
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
                                <td colSpan={columns.length} className="py-16 text-center">
                                    <div className="text-muted-foreground/30 font-medium text-xs uppercase tracking-widest">
                                        No modifications found
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-2 border-t border-border bg-muted/5 text-[10px] text-muted-foreground/40 flex justify-between items-center font-mono">
                <div className="flex gap-4">
                    <span>TOTAL: {data.length}</span>
                    <span>SELECTED: {Object.keys(rowSelection).length}</span>
                </div>
                <span className="opacity-50 uppercase tracking-widest">Grid Engine 2.1.2</span>
            </div>
        </div>
    );
};
