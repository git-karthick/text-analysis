Yes—TanStack Table can be wrapped into a generic, Chakra-styled, server-side table so the same component is reused anywhere while delegating data-fetching to an existing useApiQuery hook. This approach relies on TanStack’s headless table core with manual pagination/sorting and Chakra’s table primitives rendered via flexRender.[1][2][3][4]

### Component design
- The reusable component accepts columns, a fetch key, an input filter, and a mapper that converts TanStack’s sorting state into SortBy/IsSortAscending for the BisViewAccountFilterRequest, while using manualPagination and manualSorting to delegate data operations to the backend.[5][1]
- Rendering uses Chakra’s Table, Thead, Tbody, Th, and Td with TanStack’s flexRender so the same core can be dropped into any page with consistent styling.[2][4]
- The component exposes props for pageSize options, initial pagination/sort, and a stable query key to plug straight into the existing useApiQuery hook.[3][5]

### Type contracts
The following types mirror the backend DTOs and enable full typing for columns and results.[1][3]

```ts
// types.ts
export type AccountRow = {
  bankId: number;
  accountNumber: string;
  bankAccountId: string;
  newStatus: string;
  status: string;
  glAccountNumber: string;
  ownerStatus: string;
  bankName: string;
  carrierZip: string;
};

export type QueryResult<T> = {
  totalItems: number;
  items: T[];
};

export type BisViewAccountFilterRequest = {
  BankId?: number;
  AccountNumber?: string;
  BankAccountId?: string;
  NewStatus?: string;
  Status?: string;
  SortBy?: string;
  IsSortAscending?: boolean;
  Page?: number;
  PageSize?: number;
};
```
These interfaces align with TanStack’s generic ColumnDef<T> usage and the manual server-side model.[5][1]

### Reusable DataTable component
The code below implements a generic DataTable<T> using TanStack’s useReactTable with manualPagination and manualSorting; it delegates fetching to a provided getQuery function that wraps the existing useApiQuery hook.[1][5]

```tsx
// DataTable.tsx
import React from "react";
import {
  Table, TableContainer, Thead, Tbody, Tr, Th, Td,
  HStack, Button, Select, Spinner, Text, Box
} from "@chakra-ui/react";
import {
  ColumnDef, flexRender, getCoreRowModel, useReactTable, SortingState
} from "@tanstack/react-table";

type QueryResult<T> = { totalItems: number; items: T[]; };

export type DataTableProps<TData, TFilter> = {
  columns: ColumnDef<TData, any>[];
  // Maps TanStack columnId -> backend field (for SortBy)
  sortFieldMap?: Record<string, string>;
  initialFilter?: Partial<TFilter>;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  initialSort?: SortingState;
  // Integrate existing useApiQuery hook via this factory
  // It must return { data, isFetching, refetch } and accept the request payload as deps
  getQuery: (payload: any) => {
    data: QueryResult<TData> | undefined;
    isFetching: boolean;
    refetch?: () => void;
  };
};

export function DataTable<TData, TFilter>({
  columns,
  sortFieldMap = {},
  initialFilter,
  pageSizeOptions = [10, 20, 50, 100],
  initialPageSize = 20,
  initialSort = [],
  getQuery,
}: DataTableProps<TData, TFilter>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSort);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const mapSorting = (s: SortingState) => {
    if (s.length === 0) return { SortBy: undefined, IsSortAscending: undefined };
    const first = s;
    const apiField = sortFieldMap[first.id] ?? first.id;
    return { SortBy: apiField, IsSortAscending: first.desc ? false : true };
  };

  const requestPayload = {
    ...(initialFilter as object),
    ...mapSorting(sorting),
    Page: pageIndex,
    PageSize: pageSize,
  };

  const { data, isFetching } = getQuery(requestPayload);

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    state: { sorting, pagination: { pageIndex, pageSize } },
    pageCount: Math.max(1, Math.ceil((data?.totalItems ?? 0) / pageSize)),
  });

  const total = data?.totalItems ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box>
      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            {table.getHeaderGroups().map(hg => (
              <Tr key={hg.id}>
                {hg.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <Th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      cursor={canSort ? "pointer" : "default"}
                      isNumeric={header.column.columnDef.meta?.isNumeric}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortDir ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {isFetching ? (
              <Tr>
                <Td colSpan={columns.length}>
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Loading…</Text>
                  </HStack>
                </Td>
              </Tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <Td key={cell.id} isNumeric={cell.column.columnDef.meta?.isNumeric}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <HStack justify="space-between" mt={3}>
        <HStack>
          <Button size="sm" onClick={() => setPageIndex(0)} isDisabled={pageIndex === 0 || isFetching}>First</Button>
          <Button size="sm" onClick={() => setPageIndex(Math.max(0, pageIndex - 1))} isDisabled={pageIndex === 0 || isFetching}>Prev</Button>
          <Button
            size="sm"
            onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
            isDisabled={pageIndex >= pageCount - 1 || isFetching}
          >
            Next
          </Button>
          <Button
            size="sm"
            onClick={() => setPageIndex(pageCount - 1)}
            isDisabled={pageIndex >= pageCount - 1 || isFetching}
          >
            Last
          </Button>
        </HStack>

        <HStack>
          <Text>Page {pageIndex + 1} of {pageCount} • {total} rows</Text>
          <Select
            size="sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
            width="auto"
          >
            {pageSizeOptions.map(ps => <option key={ps} value={ps}>{ps} / page</option>)}
          </Select>
        </HStack>
      </HStack>
    </Box>
  );
}
```
This implementation follows TanStack’s server-side model by setting manualPagination/manualSorting and calculating pageCount from totalItems.[5][1]

### Wiring with useApiQuery
This example shows how to reuse the component for the BIS Accounts API, assuming useApiQuery accepts a key, url, and body and returns { data, isFetching }.[6][5]

```tsx
// AccountsPage.tsx
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import type { AccountRow, BisViewAccountFilterRequest, QueryResult } from "./types";
import { useApiQuery } from "../hooks/useApiQuery"; // existing reusable hook

const columnHelper = createColumnHelper<AccountRow>();

const columns: ColumnDef<AccountRow, any>[] = [
  columnHelper.accessor("bankId", { header: "Bank Id", meta: { isNumeric: true } }),
  columnHelper.accessor("accountNumber", { header: "Account Number" }),
  columnHelper.accessor("bankAccountId", { header: "Bank Account Id" }),
  columnHelper.accessor("newStatus", { header: "New Status" }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("glAccountNumber", { header: "GL Account Number" }),
  columnHelper.accessor("ownerStatus", { header: "Owner Status" }),
  columnHelper.accessor("bankName", { header: "Bank Name" }),
  columnHelper.accessor("carrierZip", { header: "Carrier Zip" }),
];

const sortFieldMap: Record<string, string> = {
  bankId: "bank_id",
  accountNumber: "account_number",
  bankAccountId: "bank_account_id",
  newStatus: "new_status",
  status: "status",
  glAccountNumber: "gl_account_number",
  ownerStatus: "owner_status",
  bankName: "bank_name",
  carrierZip: "carrier_zip",
};

export default function AccountsPage() {
  const initialFilter: Partial<BisViewAccountFilterRequest> = {
    SortBy: "bank_name",
    IsSortAscending: false,
    Page: 0,
    PageSize: 20,
  };

  return (
    <DataTable<AccountRow, BisViewAccountFilterRequest>
      columns={columns}
      sortFieldMap={sortFieldMap}
      initialFilter={initialFilter}
      getQuery={(payload) =>
        useApiQuery<QueryResult<AccountRow>>({
          key: ["accounts", payload],
          url: "/api/accounts/search",
          method: "POST",
          body: payload,
          keepPreviousData: true,
        })
      }
    />
  );
}
```
This pattern keeps the table purely presentational and the fetching logic pluggable, following TanStack’s headless design and Chakra’s composable UI primitives.[4][3]

### Notes
- manualPagination tells the table that incoming data is already paginated and requires either rowCount or pageCount; in this example pageCount is derived from totalItems for consistency.[1]
- Sorting is lifted into component state and mapped to the backend via SortBy and IsSortAscending, matching TanStack’s manualSorting model and onSortingChange handler.[7][8]
- The same DataTable can back any entity by changing columns, sortFieldMap, and the useApiQuery wrapper without altering internal table logic.[3][5]

[1](https://tanstack.com/table/v8/docs/guide/pagination)
[2](https://hygraph.com/blog/react-table)
[3](https://tanstack.com/table)
[4](https://chakra-ui.com/docs/components/table)
[5](https://tanstack.com/table/latest/docs/framework/react/guide/table-state)
[6](https://refine.dev/docs/packages/tanstack-table/introduction/)
[7](https://tanstack.com/table/v8/docs/guide/sorting)
[8](https://tanstack.com/table/v8/docs/api/features/sorting)
[9](https://dev.to/serhatgenc/creating-a-reusable-table-component-with-react-table-and-material-ui-10jd)
[10](https://tanstack.com/table/v8/docs/framework/react/examples/pagination)
[11](https://www.contentful.com/blog/tanstack-table-react-table/)
[12](https://dev.to/esponges/create-a-reusable-react-table-component-with-typescript-56d4)
[13](https://ui.shadcn.com/docs/components/data-table)
[14](https://newbeelearn.com/blog/using-tanstack-table-in-react/)
[15](https://stackoverflow.com/questions/74321216/tanstack-v8-react-table-how-to-sort-server-side-with-manualsorting)
[16](https://blog.logrocket.com/tanstack-table-formerly-react-table/)
[17](https://github.com/TanStack/table/discussions/2193)
[18](https://www.material-react-table.com/docs/guides/pagination)
[19](https://www.youtube.com/watch?v=F4zshDInsJY)
[20](https://tanstack.com/table/latest/docs/framework/react/examples/basic)
