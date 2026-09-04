import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  styled,
  Paper,
  IconButton,
  Collapse,
  CircularProgress,
} from "@mui/material";
import { FilterList, ExpandLess } from "@mui/icons-material";
import { GridFilters } from "@/hooks/useGrid";
import dayjs, { Dayjs } from "dayjs";

/**
 * Describes a field for filtering.
 */

export interface FilterField<
  T extends Record<string, unknown>,
  Extra extends Record<string, any> = Record<string, unknown>,
> {
  /** The field key (and name) to filter on. */
  name: (keyof T | keyof Extra) & string;

  /** The display label for the field (defaults to the field name). */
  label: string;
  /**
   * The type of the field. Determines the input type and conversion.
   * Defaults to "string".
   */
  type?: "string" | "number" | "date" | "boolean";

  /**
   * The default value for the field.
   */
  defaultValue?: any;

  /**
   * A custom React element to render for the field.
   * If provided, it will override the default input rendering.
   */
  fieldElement?: (
    value: any,
    onChange: (value: any) => void
  ) => React.ReactNode;
}

/**
 * Props for the FiltersMenu component.
 */
export interface FiltersMenuProps<
  T extends Record<string, unknown>,
  Extra extends Record<string, any> = Record<string, unknown>,
> {
  /**
   * An array of filter field definitions.
   */
  fields: Array<FilterField<T, Extra>>;
  /**
   * Callback invoked when filters are applied.
   */
  onFiltersChange: (model: GridFilters<T>) => void;
  /**
   * Indicates fields values are still loading.
   * The menu will be disabled and will display a loading inficator.
   */
  isLoading?: boolean;
}

const FiltersPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

/**
 * A reusable filters menu component that renders inputs based on static fields defined by the developer.
 *
 * @example
 * <FiltersMenu
 *   fields={[
 *     { name: "firstName", type: "string" },
 *     { name: "age", type: "number" },
 *     { name: "createdAt", type: "date", label: "Created Date" },
 *   ]}
 *   onFiltersChange={(filters) => console.log(filters)}
 * />
 */
export function FiltersMenu<
  T extends Record<string, unknown>,
  Extra extends Record<string, any> = Record<string, unknown>,
>({ fields, onFiltersChange, isLoading = false }: FiltersMenuProps<T, Extra>) {
  // Deduplicate fields based on the 'name' property.
  const uniqueFields = useMemo(() => {
    const seen = new Set<string>();
    return fields.filter((field) => {
      if (seen.has(field.name)) return false;
      seen.add(field.name);
      return true;
    });
  }, [fields]);

  // Initialize state
  const initialState = useMemo(
    () =>
      uniqueFields.reduce(
        (acc, field) => {
          acc[field.name] =
            field.defaultValue ?? (field.type === "date" ? null : "");

          return acc;
        },
        {} as Record<string, any>
      ),
    [uniqueFields]
  );

  const [filterValues, setFilterValues] =
    useState<Record<string, any>>(initialState);

  const handleInputChange = useCallback(
    <K extends keyof T>(
      name: K,
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFilterValues((prev) => ({ ...prev, [name]: event.target.value }));
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    const isEmpty = (value: unknown): boolean => {
      if (typeof value === "string") {
        return value.trim() === "";
      }
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return value === null || value === undefined;
    };

    function normalizeFilterValue<T extends Record<string, unknown>>(
      field: FilterField<T>,
      raw: string | Dayjs | boolean | null
    ): string | number | boolean | Array<any> | null {
      // empty check
      if (raw == null || (typeof raw === "string" && !raw.trim())) {
        return null;
      }

      // dayjs
      if (dayjs.isDayjs(raw)) return raw.format("YYYY-MM-DD").toString();

      // array
      if (Array.isArray(raw)) return raw.length <= 0 ? null : raw;

      switch (field.type) {
        case "boolean": {
          if (typeof raw === "boolean") return raw;
          return raw.toString().toLowerCase() === "true"
            ? true
            : raw.toString().toLowerCase() === "false"
              ? false
              : null;
        }
        case "number": {
          // convert numeric strings to real numbers
          const n = Number(raw);
          return isNaN(n) ? null : n;
        }
        case "date": {
          return raw.toString();
        }
        default:
          return raw.toString().trim();
      }
    }

    const out: GridFilters<T> = { filters: [] };

    uniqueFields.forEach((field) => {
      const raw = filterValues[field.name];
      if (isEmpty(raw)) return;

      if (Array.isArray(raw) && raw.length > 0) {
        raw.forEach((value: any) => {
          const normalizedValue = normalizeFilterValue(field, value);
          if (normalizedValue != null) {
            out.filters.push({
              field: field.name as (keyof T | keyof Extra) & string,
              value: normalizedValue,
            });
          }
        });
      } else {
        const normalizedValue = normalizeFilterValue(field, raw);
        if (normalizedValue != null) {
          out.filters.push({
            field: field.name as (keyof T | keyof Extra) & string,
            value: normalizedValue,
          });
        }
      }
    });

    onFiltersChange(out);
  }, [onFiltersChange, filterValues, uniqueFields]);

  const handleReset = useCallback(() => {
    setFilterValues(initialState);

    onFiltersChange({
      filters: [],
    });
  }, [onFiltersChange, initialState]);

  return (
    <FiltersPaper elevation={3}>
      <Box
        display="grid"
        gap={2}
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        }}
        sx={{
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? "none" : "auto", 
        }}
      >
        {/* Header */}
        <Typography variant="h6" sx={{ gridColumn: "1 / -1" }}>
          ادوات البحث
        </Typography>

        {fields.map((field) => (
          <Box key={field.name}>
            {field.fieldElement ? (
              field.fieldElement(filterValues[field.name], (value) => {
                setFilterValues((prev) => ({
                  ...prev,
                  [field.name]: value,
                }));
              })
            ) : (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                value={filterValues[field.name]}
                onChange={(e) => handleInputChange(field.name, e)}
                size="small"
                variant="outlined"
                type={field.type || "text"}
                fullWidth
                disabled={isLoading}
              />
            )}
          </Box>
        ))}

        {/* Buttons */}
        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            بحث
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            مسح
          </Button>
        </Box>
      </Box>
    </FiltersPaper>
  );
}

/**
 * A toggleable wrapper for the FiltersMenu component.
 * Displays a button to show/hide the filters menu.
 *
 * @example
 * <ToggleableFiltersMenu
 *   fields={['firstName', 'lastName', 'age'].map(field => ({ name: field, label: field }))}
 *   onFiltersChange={(filters) => console.log(filters)}
 * />
 */
export function ToggleableFiltersMenu<
  T extends Record<string, unknown>,
  Extra extends Record<string, any> = Record<string, unknown>,
>(props: FiltersMenuProps<T>) {
  const [open, setOpen] = useState<boolean>(true);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <IconButton
        onClick={toggleOpen}
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          borderRadius: 2,
          transition: "0.3s",
          "&:hover": { backgroundColor: "primary.dark" },
        }}
      >
        {open ? <ExpandLess /> : <FilterList />}
      </IconButton>
      <Collapse in={open} timeout={300}>
        <FiltersMenu<T, Extra> {...props} />
      </Collapse>
    </Box>
  );
}
