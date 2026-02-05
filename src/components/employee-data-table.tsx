"use client";

import React from 'react';
import { useState, useMemo, useRef, ChangeEvent } from 'react';
import type { Employee } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, AlertTriangle } from 'lucide-react';

type SortConfig = {
  key: keyof Employee | null;
  direction: 'ascending' | 'descending';
};

export function EmployeeDataTable({ data }: { data: Employee[] }) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key!;
        const aValue = (a as any)[key];
        const bValue = (b as any)[key];

        if (aValue === undefined || bValue === undefined) return 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const requestSort = (key: keyof Employee) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  const SortableHeader = ({ tkey, label }: { tkey: keyof Employee, label: string }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => requestSort(tkey)}>
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader tkey="Emp_ID" label="Emp ID" />
              <SortableHeader tkey="Name" label="Name" />
              <SortableHeader tkey="Department" label="Department" />
              <SortableHeader tkey="Total_Salary" label="Total Salary" />
              <SortableHeader tkey="Predicted_Salary" label="Predicted (90% CI)" />
              <SortableHeader tkey="Anomaly_Label" label="Anomaly" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((employee: Employee) => (
              <TableRow key={employee.Emp_ID} className={employee.Anomaly_Label === 'Anomaly' ? 'bg-destructive/10' : ''}>
                <TableCell>{employee.Emp_ID}</TableCell>
                <TableCell className="font-medium">{employee.Name}</TableCell>
                <TableCell>{employee.Department}</TableCell>
                <TableCell>{formatCurrency(employee.Total_Salary)}</TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(employee.Predicted_Salary)}</div>
                  {employee.Lower_Bound && employee.Upper_Bound && (
                    <div className="text-[10px] text-muted-foreground">
                      [{formatCurrency(employee.Lower_Bound)} - {formatCurrency(employee.Upper_Bound)}]
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {employee.Anomaly_Label === 'Anomaly' ? (
                    <Badge {...{ variant: "destructive" as any, className: "flex items-center w-fit" } as any}>
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Anomaly
                    </Badge>
                  ) : (
                    <Badge {...{ variant: "secondary" as any, className: "w-fit" } as any}>Normal</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
