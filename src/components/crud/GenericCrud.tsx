import { useCallback, useEffect, useMemo } from "react";
import { Box, Theme, useMediaQuery } from "@mui/material";
import {
  DataGridPremium,
  DataGridPremiumProps,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridListColDef,
  GridPremiumSlotsComponent,
  GridToolbar,
  GridLoadingOverlayProps
} from "@mui/x-data-grid-premium";
import {
  CrudProvider,
  List,
  Create,
  Show,
  Edit,
  DataSource,
  DataModel,
} from "@toolpad/core";
import useCustomRouter from "@/hooks/useCustomRouter";
import { useToast } from "@/hooks/useToast";
import { usePageTitleStore } from "@/store";
import {
  DataGridArLocaleText,
  CRUDLocaleTextEgyptianArabic as CRUDLocaleTextAr,
} from "@/common/constants";
import { GRID_DIMENSIONS, GRID_LAYOUT } from "@/common/grid.constants";
import {
  CellWithTracer,
  NoRowsOverlay,
} from "@/components/grid/CustomGridComponents";
import { CRUDLocaleText } from "@toolpad/core/Crud/localeText";
import { extractIdFromPath } from "@/utils";
import { DataGridConfig } from "@/types";

const DEFAULT_DATA_GRID_CONFIG: Required<DataGridConfig> = {
  containerHeight: GRID_DIMENSIONS.Default.Height,
  containerMinHeight: GRID_DIMENSIONS.Default.MinHeight,
  overlayHeight: GRID_LAYOUT.OverlayHeight,
  listViewRowHeight: GRID_LAYOUT.ListViewRowHeight,
  defaultRowHeight: GRID_LAYOUT.DefaultRowHeight,
};

export interface GenericCrudProps<T extends DataModel> {
  /**
   * The primary data source for CRUD operations.
   */
  dataSource: DataSource<T>;

  /**
   * The data source used specifically for creating a new entity.
   * Must implement the `createOne` method.
   */
  createDataSource?: DataSource<T> & Required<Pick<DataSource<T>, "createOne">>;

  /**
   * The data source used for fetching a single entity.
   * Must implement the `getOne` method.
   */
  showDataSource?: DataSource<T> & Required<Pick<DataSource<T>, "getOne">>;

  /**
   * The data source used for editing an existing entity.
   * Must implement both `getOne` (to fetch data) and `updateOne` (to apply updates).
   */
  editDataSource?: DataSource<T> & Required<Pick<DataSource<T>, "getOne" | "updateOne">>;

  /**
   * The base path for the CRUD routes (e.g., "/users" for user management).
   */
  rootPath: string;

  /**
   * Default values for form fields when creating a new entity.
   * These values will be pre-filled in the creation form.
   */
  defaultValues?: Partial<T>;

  /**
   * Custom localization text for labels, buttons, and messages.
   * Allows customization of UI text to match the desired language or phrasing.
   */
  localeText?: CRUDLocaleText;

  /**
   * The name of the entity being managed (e.g., "User", "Product").
   * Used for display purposes in UI components.
   */
  entityName: string;

  /**
   * Configuration for defining the columns displayed in the entity list view.
   * Specifies which fields appear in the data grid when at breakpoint md or less.
   */
  listColDef?: GridListColDef;

  dataGridConfig?: DataGridConfig;
}

export function GenericCrud<T extends DataModel>({
  dataSource,
  createDataSource,
  showDataSource,
  editDataSource,
  rootPath,
  defaultValues,
  localeText,
  entityName,
  listColDef,
  dataGridConfig = DEFAULT_DATA_GRID_CONFIG,
}: GenericCrudProps<T>) {
  const isListView =
    useMediaQuery((theme) => theme.breakpoints.down("md")) &&
    Boolean(listColDef);
  const router = useCustomRouter();
  const { setTitle } = usePageTitleStore();
  const { showToast } = useToast();
  const pathname = router.pathname;

  // Memoized merged config
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_DATA_GRID_CONFIG, ...dataGridConfig }),
    [dataGridConfig]
  );

  // Route patterns
  const routes = useMemo(
    () => ({
      list: rootPath,
      create: `${rootPath}/new`,
      show: `${rootPath}/:id`,
      edit: `${rootPath}/:id/edit`,
    }),
    [rootPath]
  );

  // Determine which view to show based on the current pathname.
  const [showId, editId] = useMemo(
    () => [
      extractIdFromPath(routes.show, pathname),
      extractIdFromPath(routes.edit, pathname),
    ],
    [pathname, routes]
  );

  // Memoized grid settings
  const rowHeight = useMemo(
    () =>
      isListView
        ? mergedConfig.listViewRowHeight
        : mergedConfig.defaultRowHeight,
    [isListView, mergedConfig]
  );

  // Page title management
  const pageTitle = useMemo(() => {
    if (pathname === routes.create) return `${entityName} جديد`;
    if (editId) return `تعديل ${entityName} ${editId}`;
    if (showId) return `${entityName} ${showId}`;
    return "";
  }, [pathname, routes.create, editId, showId, entityName]);

  useEffect(() => {
    setTitle(pageTitle);
  }, [pageTitle, setTitle]);

  // Navigation callbacks
  const handleListNavigation = useCallback(() => {
    router.navigate(rootPath);
  }, [router, rootPath]);

  const handleEditNavigation = useCallback(
    (id: string | number) => {
      router.navigate(`${rootPath}/${id}/edit`);
    },
    [router, rootPath]
  );

  const handleOnDelete = useCallback(() => {
    showToast("تم الحذف", { type: "success", theme: "dark", autoClose: 1000 });
  }, [showToast]);

  // DataGrid configuration
  const dataGridSlots = useMemo(
    (): Partial<GridPremiumSlotsComponent> => ({
      cell: CellWithTracer,
      noRowsOverlay: NoRowsOverlay,
      noResultsOverlay: NoRowsOverlay,
      toolbar: GridToolbar,
    }),
    []
  );

  const dataGridSlotProps = useMemo(
    () => ({
      toolbar: { showQuickFilter: true },
      loadingOverlay: {
        variant: 'linear-progress',
        noRowsVariant: 'skeleton',
      } as GridLoadingOverlayProps,
      filterPanel: {
        filterFormProps: {
          logicOperatorInputProps: { variant: "outlined", size: "small" },
          columnInputProps: {
            variant: "outlined",
            size: "small",
            sx: { mt: "auto" },
          },
          operatorInputProps: {
            variant: "outlined",
            size: "small",
            sx: { mt: "auto" },
          },
          valueInputProps: {
            InputComponentProps: { variant: "outlined", size: "small" },
          },
        },
      },
    }),
    []
  );

  // Memoized grid container styles
  const gridContainerSx = useMemo(
    () => (theme: Theme) => ({
      height: mergedConfig.containerHeight,
      maxHeight: mergedConfig.containerHeight,
      minHeight: mergedConfig.containerMinHeight,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      "&&& .updated": {
        transition: theme.transitions.create(["background-color", "outline"], {
          duration: theme.transitions.duration.standard,
        }),
      },
      "&&& .updating": {
        backgroundColor: "rgb(92 199 68 / 20%)",
        outline: "1px solid rgb(92 199 68 / 35%)",
        outlineOffset: "-1px",
        transition: "none",
      },
    }),
    [mergedConfig]
  );

  // Memoized grid styles
  const gridSx = useMemo(
    () => (theme: Theme) => ({ // Parameter 'theme' implicitly has an 'any' type.
      boxShadow: 2,
      border: 2,
      borderColor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[700]
          : theme.palette.grey[200],
      "& .MuiDataGrid-cell": {
        borderColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[700]
            : theme.palette.grey[200],
      },
      "& .MuiDataGrid-cell:last-child": {
        borderRight: "none",
      },
      "--DataGrid-overlayHeight": `${mergedConfig.overlayHeight}px`,
    }),
    [mergedConfig.overlayHeight]
  );

  // Memoized list view configuration
  const listViewConfig = useMemo(
    () => ({
      unstable_listView: isListView,
      unstable_listColumn: listColDef,
    }),
    [isListView, listColDef]
  );
  
  const renderList = () => (
    <List<T>
      initialPageSize={10}
      onRowClick={(id) => router.navigate(`${rootPath}/${id}`)}
      onCreateClick={() => router.navigate(routes.create)}
      onEditClick={(id) => handleEditNavigation(id)}
      localeText={localeText || CRUDLocaleTextAr}
      onDelete={() => handleOnDelete()}
      slots={{
        dataGrid: (props: DataGridPremiumProps) => (
          <Box sx={gridContainerSx}>
            <DataGridPremium
              {...props}
              sx={gridSx}
              pageSizeOptions={[5, 10, 20, 100, { label: "الكل", value: -1 }]}
              pinnedColumns={
                isListView
                  ? undefined
                  : {
                      left: ["actions"],
                      right: [GRID_CHECKBOX_SELECTION_COL_DEF.field],
                    }
              }
              rowHeight={rowHeight}
              slots={dataGridSlots}
              slotProps={dataGridSlotProps}
              {...listViewConfig}
            />
          </Box>
        ),
      }}
      slotProps={{
        dataGrid: {
          localeText: {...DataGridArLocaleText, "toolbarQuickFilterPlaceholder": "ابحث بالاسم...", "toolbarQuickFilterLabel": "البحث بالاسم"},
        },
      }}
    />
  );

  const renderCreate = () => (
    <Create<T>
      dataSource={createDataSource}
      initialValues={defaultValues}
      onSubmitSuccess={handleListNavigation}
      resetOnSubmit={false}
      localeText={localeText || CRUDLocaleTextAr}
    />
  );

  const renderShow = (showId: string) => (
    <Show<T>
      id={showId}
      dataSource={showDataSource}
      onEditClick={(id) => handleEditNavigation(id)}
      onDelete={handleListNavigation}
      localeText={localeText || CRUDLocaleTextAr}
    />
  );

  const renderEdit = (editId: string) => (
    <Edit<T>
      id={editId}
      dataSource={editDataSource}
      onSubmitSuccess={handleListNavigation}
      localeText={localeText || CRUDLocaleTextAr}
    />
  );

  return (
    <CrudProvider<T> dataSource={dataSource}>
      {pathname === routes.list && renderList()}
      {pathname === routes.create && renderCreate()}
      {showId && !editId && renderShow(showId)}
      {editId && renderEdit(editId)}
    </CrudProvider>
  );
}

// every entity would have their own searchable field which leads to every entity datagrid would have their own custom "toolbarQuickFilterPlaceholder" and "toolbarQuickFilterLabel" in the localeText, so what is the best way to do that, do i recive them as a prop?
