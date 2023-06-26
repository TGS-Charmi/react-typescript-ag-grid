import * as React from 'react';
import { render } from 'react-dom';
import './style.css';
import _ from 'lodash';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import History from '@mui/icons-material/History';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  SideBarDef,
  IHeaderParams,
  SortModelItem,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import countryDataSource from './country.json';

const HeaderCheckBox = (props: IHeaderParams) => {
  const [checked, setChecked] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    props.api.forEachNode((node: any) =>
      node.setSelected(event.target.checked)
    );
  };

  return (
    <div>
      <Checkbox
        sx={{ padding: '0px' }}
        size="small"
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'controlled' }}
      />
    </div>
  );
};

const App: React.FunctionComponent = () => {
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridReadyEvent>();
  const defaultColDef: ColDef = {
    sortable: true,
    flex: 1,
    minWidth: 200,
    filter: true,
    resizable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    floatingFilter: true,
    enableValue: true,
  };
  const [columnDefs, setColumnDefs] = React.useState<ColDef[]>([
    {
      headerName: ' ',
      checkboxSelection: true,
      floatingFilter: false,
      suppressMenu: true,
      minWidth: 55,
      resizable: false,
      sortable: false,
      editable: false,
      filter: false,
      suppressColumnsToolPanel: true,
      headerComponent: (props: IHeaderParams) => <HeaderCheckBox {...props} />,
    },
    {
      headerName: 'Action',
      sortable: false,
      filter: false,
      minWidth: 120,
      cellRenderer: (props: ICellRendererParams) => (
        <div>
          <IconButton
            sx={{
              border: '1px solid',
              borderRadius: '5px',
              padding: '2px',
              marginRight: '2px',
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </div>
      ),
    },
    {
      headerName: '#',
      field: 'rowNum',
      minWidth: 50,
      flex: 0,
      sortable: false,
      editable: false,
      filter: false,
      cellRenderer: (props: ICellRendererParams) => (
        <div>{props.rowIndex + 1}</div>
      ),
    },
    {
      headerName: 'Country',
      field: 'countryName',
      minWidth: 200,
      headerComponent: (props: IHeaderParams) => (
        <div className="custom-header">
          <a
            href="https://www.ag-grid.com/react-data-grid/component-header/"
            target="_blank"
          >
            {props.displayName}
          </a>
        </div>
      ),
    },
    {
      headerName: 'Code',
      field: 'countrySortCode',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (props: ICellRendererParams) =>
        props.value !== null && (
          <a className="text-decoration link-text">{props.value}</a>
        ),
    },
    {
      field: 'isActiveConvertedValue',
      headerName: 'Active Country',
      minWidth: 120,
      filter: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filter: 'agTextColumnFilter',
          },
          {
            filter: 'agSetColumnFilter',
            filterParams: {
              values: ['Active', 'Inactive'],
            },
          },
        ],
      },
      menuTabs: ['filterMenuTab'],
      cellRenderer: (props: ICellRendererParams) => (
        <Chip
          color={props.value === 'Inactive' ? 'primary' : 'success'}
          label={props.value}
        />
      ),
    },
    {
      headerName: 'Image',
      field: 'imageName',
      minWidth: 100,
      cellRenderer: (props: ICellRendererParams) =>
        props.value !== null && <img src={props.value} width={50} />,
      sortable: false,
      editable: false,
      filter: false,
    },
    {
      headerName: 'Alias',
      field: 'aliaslist',
      minWidth: 350,
      filter: 'agTextColumnFilter',
      headerTooltip: 'Alias For Country',
      wrapText: true,
    },
    {
      field: 'updatedAt',
      headerName: 'Modified Date',
      minWidth: 200,
      filter: 'agDateColumnFilter',
    },
    {
      field: 'updatedby',
      minWidth: 145,
      headerName: 'Last Modified By',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'updatedbyRole',
      minWidth: 145,
      headerName: 'Last Modified By Role',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'createdAt',
      minWidth: 200,
      headerName: 'Created Date',
      filter: 'agDateColumnFilter',
    },
    {
      field: 'createdby',
      minWidth: 145,
      headerName: 'Created By',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'createdbyRole',
      minWidth: 145,
      headerName: 'Created By Role',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Delete',
      sortable: false,
      filter: false,
      cellRenderer: (props: ICellRendererParams) => (
        <div>
          <IconButton
            sx={{
              border: '1px solid',
              borderRadius: '5px',
              padding: '2px',
              marginRight: '2px',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      ),
    },
  ]);

  const sideBar = React.useMemo<
    SideBarDef | string | string[] | boolean | null
  >(() => {
    return {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressPivots: true,
            suppressPivotMode: true,
            suppressRowGroups: true,
            suppressValues: true,
          },
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        },
      ],
    };
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params);
  };

  React.useEffect(() => {
    if (gridApi) {
      const datasource: IServerSideDatasource = {
        getRows: async (params: IServerSideGetRowsParams) => {
          const requestParams = params.request;
          console.log('requestParams', requestParams);
          const SortColumns: any = [];
          _.map(requestParams.sortModel, (item: SortModelItem) => {
            const propertyValues = Object.values(item);
            [propertyValues[0], propertyValues[1]] = [
              propertyValues[1],
              propertyValues[0],
            ];
            SortColumns.push(propertyValues);
          });
          const SearchColumns = Object.entries(
            requestParams.filterModel
          ).reduce((acc: any, curr: any) => {
            const [key, val] = curr;
            const SearchStringArry: string[] = [];
            if (val.filterType === 'multi') {
              _.map(val.filterModels, (item: any) => {
                if (item) {
                  if (item.filterType === 'text') {
                    SearchStringArry.push(item.filter);
                  } else if (item.filterType === 'set') {
                    if (item.values) {
                      const allValues = item.values.toString();
                      SearchStringArry.push(allValues);
                    }
                  } else if (item.filterType === 'date') {
                    if (item.dateFrom) {
                      const dateVal = item.dateFrom.slice(0, 10);
                      SearchStringArry.push(dateVal);
                    }
                  }
                }
              });
            } else if (val.filterType == 'text') {
              if (val.filter) {
                SearchStringArry.push(val.filter);
              }
            } else if (val.filterType === 'set') {
              if (val.values) {
                const allValues = val.values.toString();
                SearchStringArry.push(allValues);
              }
            } else if (val.filterType === 'date') {
              if (val.dateFrom) {
                const dateVal = val.dateFrom.slice(0, 10);
                SearchStringArry.push(dateVal);
              }
            }

            acc.push({
              ColumnName: key,
              SearchString: SearchStringArry.join(),
            });
            return acc;
          }, []);

          let countryData: any = countryDataSource;
          if (SortColumns && SortColumns.length > 0) {
            countryData = _.orderBy(
              countryData,
              SortColumns.map((item: any) => item[0]),
              SortColumns.map((item: any) => item[1]?.toLowerCase())
            );
          }

          if (SearchColumns && SearchColumns.length > 0) {
            _.each(SearchColumns, (columns: any) => {
              countryData = _.filter(countryData, (item: any) => {
                return item[columns.ColumnName]
                  ?.toLowerCase()
                  .includes(columns.SearchString?.toLowerCase());
              });
            });
          }
          const Count = countryData.length; // Total length of Country Data
          let country = countryData.slice(
            requestParams.startRow,
            requestParams.endRow
          );
          // This lastrow logic is not working as it goes infinite calls to get
          var lastRow = -1;
          if (Count <= requestParams.endRow) {
            lastRow = Count;
          }
          const response = {
            success: true,
            rows: country,
            lastRow: requestParams.endRow,
          };
          if (response.rows && !response.rows.length) {
            gridRef.current?.api.showNoRowsOverlay();
          } else {
            gridRef.current?.api.hideOverlay();
          }
          if (response.success) {
            return params.success({
              rowData: response.rows,
              rowCount: response.lastRow,
            });
          } else {
            return params.fail();
          }
        },
      };
      gridApi?.api?.setServerSideDatasource(datasource);
    }
  }, [gridApi]);

  return (
    <div style={{ height: 800 }}>
      Infinite scrolling grid
      <div style={{ height: 'calc(100% - 25px)' }} className="ag-theme-alpine">
        <div style={{ height: '100%', width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowModelType={'serverSide'}
            rowSelection={'multiple'}
            rowBuffer={0}
            cacheBlockSize={100}
            cacheOverflowSize={0}
            maxConcurrentDatasourceRequests={1}
            infiniteInitialRowCount={1}
            maxBlocksInCache={10}
            onGridReady={onGridReady}
            alwaysMultiSort
            sideBar={sideBar}
            overlayNoRowsTemplate={
              '<span className="ag-overlay-loading-center">No data found to display.</span>'
            }
            tooltipShowDelay={500}
            enableRangeSelection
            allowContextMenuWithControlKey
            suppressRowClickSelection
            animateRows
            suppressCopyRowsToClipboard
            suppressColumnVirtualisation
            rowDragManaged
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
};

export default App;
