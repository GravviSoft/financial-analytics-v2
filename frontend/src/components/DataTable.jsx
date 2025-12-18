import React, { useState, useRef } from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import './DataTable.css';

const DataTable = ({ title, data, columns, downloadName, rows = 10, rowsPerPageOptions = [10, 25, 50, 100] }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const tableRef = useRef(null);

  const statusBodyTemplate = (rowData) => {
    const getSeverity = (status) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'success';
        case 'pending':
          return 'warning';
        case 'under review':
          return 'info';
        default:
          return 'secondary';
      }
    };

    return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
  };

  const header = (
    <div className="table-header">
      <h3>{title}</h3>
      <div className="table-header__actions">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
          />
        </span>
        <Button
          type="button"
          label="Download CSV"
          icon="pi pi-download"
          className="p-button-outlined p-button-sm"
          onClick={() =>
            tableRef.current?.exportCSV({
              selectionOnly: false,
              fileName: downloadName || title || 'table-export',
            })
          }
        />
      </div>
    </div>
  );

  return (
    <Card className="datatable-card">
      <PrimeDataTable
        ref={tableRef}
        value={data}
        paginator
        rows={rows}
        rowsPerPageOptions={rowsPerPageOptions}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No records found"
        className="custom-datatable"
        stripedRows
        showGridlines={false}
      >
        {columns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.sortable !== false}
            body={col.field === 'status' ? statusBodyTemplate : col.body}
            style={col.style}
          />
        ))}
      </PrimeDataTable>
    </Card>
  );
};

export default DataTable;
