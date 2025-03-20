'use client';

import { Table } from '@tanstack/react-table';
import { PlusCircle, X } from 'lucide-react';

import { Button } from '@rumsan/shadcn-ui/components/button';
import { Input } from '@rumsan/shadcn-ui/components/input';
import { DataTableViewOptions } from '@rumsan/ui/components/data-table/datatable.options.view';

import { PATHS } from '@/routes/paths';
import { useSelectLookUp } from '@rumsan/raman-ui/hooks/select-lookup.hook';
import { InvoiceStatusType } from '@rumsan/raman/types/enums';
import { useDebounce } from '@rumsan/ui/hooks/debounce.hook';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DataTableFacetedFilter } from './list.filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const isFiltered = table.getState().columnFilters.length > 0;
  const { users, projects, categories } = useSelectLookUp();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const column = table.getColumn('userId');
    if (column) {
      column.setFilterValue(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  const redirectToInvoiceCreate = () => {
    router.push(PATHS.RECEIPT.ADD);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px] bg-white"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={Object.values(InvoiceStatusType).map((status) => ({
              label: status,
              value: status,
            }))}
          />
        )}

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('userId')}
            title="User"
            options={users}
          />
        )}

        {table.getColumn('projectId') && (
          <DataTableFacetedFilter
            column={table.getColumn('projectId')}
            title="Project"
            options={projects}
          />
        )}

        {table.getColumn('categoryId') && (
          <DataTableFacetedFilter
            column={table.getColumn('categoryId')}
            title="Category"
            options={categories}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => setSearchTerm('')}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
      <Button
        className="m-auto text-sm h-8 ml-2 px-3"
        onClick={redirectToInvoiceCreate}
      >
        <PlusCircle className="h-5 w-5" />
        Add
      </Button>
    </div>
  );
}
