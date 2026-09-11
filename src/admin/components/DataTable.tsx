import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/** A column addresses a string-named property of the row. */
export type ColumnKey<T> = keyof T & string

export interface Column<T> {
  /** Key into the row; also the CSV header. */
  key: ColumnKey<T>
  header: string
  /** Custom cell rendering. Sorting and export still use the raw value. */
  render?: (row: T) => ReactNode
  /** Right-align numeric columns. */
  numeric?: boolean
  sortable?: boolean
  width?: string
}

export interface FilterDef<T> {
  key: ColumnKey<T>
  label: string
  options: string[]
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  /** Columns searched by the free-text box. Defaults to every column. */
  searchKeys?: ColumnKey<T>[]
  filters?: FilterDef<T>[]
  /** Base name for the exported CSV file. */
  exportName: string
  pageSize?: number
  emptyMessage?: string
}

type SortDir = 'asc' | 'desc'

function toCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function DataTable<T>({
  rows,
  columns,
  searchKeys,
  filters = [],
  exportName,
  pageSize = 12,
  emptyMessage = 'No rows match these filters.',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Partial<Record<ColumnKey<T>, string>>>({})
  const [sortKey, setSortKey] = useState<ColumnKey<T> | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)

  const searchable = searchKeys ?? columns.map((column) => column.key)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      for (const key of Object.keys(active) as ColumnKey<T>[]) {
        const value = active[key]
        if (value && String(row[key]) !== value) return false
      }
      if (!needle) return true
      return searchable.some((key) => String(row[key] ?? '').toLowerCase().includes(needle))
    })
  }, [rows, query, active, searchable])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      let result: number
      if (typeof left === 'number' && typeof right === 'number') result = left - right
      else result = String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? result : -result
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const visible = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  function toggleSort(key: ColumnKey<T>) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  // Exports the filtered + sorted set, not just the visible page — matching
  // what the operator can see on screen.
  function exportCsv() {
    const header = columns.map((column) => toCsvValue(column.header)).join(',')
    const body = sorted.map((row) => columns.map((column) => toCsvValue(row[column.key])).join(','))
    const csv = [header, ...body].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${exportName}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const hasFilters = Boolean(query) || Object.values(active).some(Boolean)

  return (
    <div className="flex flex-col gap-12">
      {/* Controls: search, per-column filters, export — one row above the table */}
      <div className="flex flex-wrap items-center gap-8">
        <label className="relative flex min-w-[220px] flex-1 items-center">
          <Search size={14} className="pointer-events-none absolute left-12 text-adm-muted" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(0)
            }}
            placeholder="Search…"
            className="h-34 w-full rounded-8 border border-adm-line bg-adm-surface pl-32 pr-12 text-13 text-adm-ink outline-none placeholder:text-adm-muted focus:border-adm-accent"
          />
        </label>

        {filters.map((filter) => (
          <select
            key={filter.key}
            value={active[filter.key] ?? ''}
            onChange={(event) => {
              setActive((current) => ({ ...current, [filter.key]: event.target.value }))
              setPage(0)
            }}
            className="h-34 rounded-8 border border-adm-line bg-adm-surface px-10 text-13 text-adm-ink outline-none focus:border-adm-accent"
          >
            <option value="">{filter.label}: all</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ))}

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setActive({})
              setPage(0)
            }}
            className="flex h-34 items-center gap-4 rounded-8 border border-adm-line px-10 text-13 text-adm-ink-2 hover:bg-adm-hover"
          >
            <X size={13} />
            Clear
          </button>
        )}

        <button
          type="button"
          onClick={exportCsv}
          className="flex h-34 items-center gap-6 rounded-8 border border-adm-line bg-adm-surface px-12 text-13 font-medium text-adm-ink hover:bg-adm-hover"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-10 border border-adm-line bg-adm-surface">
        <table className="w-full border-collapse text-13">
          <thead>
            <tr className="border-b border-adm-line">
              {columns.map((column, columnIndex) => {
                const sortable = column.sortable !== false
                const isSorted = sortKey === column.key
                return (
                  <th
                    key={`${column.key}-${columnIndex}`}
                    style={{ width: column.width }}
                    className={`whitespace-nowrap px-12 py-10 text-11 font-semibold uppercase tracking-wider text-adm-muted ${
                      column.numeric ? 'text-right' : 'text-left'
                    }`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className={`u-tap inline-flex items-center gap-4 hover:text-adm-ink ${
                          column.numeric ? 'flex-row-reverse' : ''
                        } ${isSorted ? 'text-adm-ink' : ''}`}
                      >
                        {column.header}
                        {isSorted ? (
                          sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                        ) : (
                          <ArrowUp size={11} className="opacity-25" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={index} className="border-b border-adm-line last:border-0 hover:bg-adm-hover">
                {columns.map((column, columnIndex) => (
                  <td
                    key={`${column.key}-${columnIndex}`}
                    className={`px-12 py-10 align-middle text-adm-ink ${
                      column.numeric ? 'text-right tabular-nums' : ''
                    }`}
                  >
                    {column.render ? column.render(row) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={columns.length} className="px-12 py-32 text-center text-adm-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-12 text-adm-muted">
        <span>
          {sorted.length ? safePage * pageSize + 1 : 0}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
          {sorted.length}
          {sorted.length !== rows.length && ` (filtered from ${rows.length})`}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="flex size-28 items-center justify-center rounded-6 border border-adm-line disabled:opacity-35 enabled:hover:bg-adm-hover"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-6 tabular-nums">
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            className="flex size-28 items-center justify-center rounded-6 border border-adm-line disabled:opacity-35 enabled:hover:bg-adm-hover"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
