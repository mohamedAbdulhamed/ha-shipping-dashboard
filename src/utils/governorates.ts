// Egypt is divided into 27 governorates and each has a capital and at least one city.

import governorates from "@/config/governorates.json";
import { z } from "zod";

export interface Subregion {
  id: string;
  name_ar: string;
  name_long: string;
  name_en: string;
}

type GovernorateID = number;

export interface Governorate {
  id: GovernorateID;
  name_ar: string;
  name_en: string;
  subregions: Subregion[];
}

const SubregionScheme: z.ZodType<Subregion> = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_long: z.string(),
  name_en: z.string(),
});

const GovernorateScheme: z.ZodType<Governorate> = z.object({
  id: z.number(),
  name_ar: z.string(),
  name_en: z.string(),
  subregions: z.array(SubregionScheme),
});

// const validatedGovernorates = [...governorates] as const satisfies readonly Governorate[];
const validatedGovernorates = GovernorateScheme.array().parse(governorates);

const governoratesMap = new Map<GovernorateID, Governorate> (
  validatedGovernorates.map(g => [g.id, g])
);

/**
 * Retrieves a complete list of governorates with their subregion data
 * 
 * @remarks
 * This function provides full administrative data including all subregions (cities/districts)
 * for every governorate in Egypt. Useful when you need complete geographical hierarchy.
 * 
 * @returns An array of Governorate objects containing:
 * - Governorate ID
 * - Arabic and English names
 * - Array of subregions with their details
 * 
 * @example
 * ```tsx
 * const allGovernorates = getGovernoratesWithSubregions();
 * 
 * allGovernorates.forEach(gov => {
 *   console.log(`${gov.name_en} has ${gov.subregions.length} subregions`);
 * });
 * ```
 */
export const getGovernoratesWithSubregions = (): Governorate[] => validatedGovernorates;

/**
 * Retrieves a specific governorate by its unique identifier
 * 
 * @param governorateId - Numeric ID of the governorate to retrieve (e.g., 1 for Cairo)
 * @returns Governorate object with full details if found, undefined otherwise
 * 
 * @remarks
 * Uses an optimized lookup map (O(1) complexity) for efficient access. Consider using
 * this instead of array searches when working with individual governorates.
 * 
 * @example
 * ```tsx
 * // Get Cairo governorate details
 * const cairo = getGovernorate(1);
 * 
 * if (cairo) {
 *   console.log(`Arabic name: ${cairo.name_ar}`);
 *   console.log(`Subregions: ${cairo.subregions.length}`);
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Handle not found case
 * const unknownGov = getGovernorate(999);
 * 
 * if (!unknownGov) {
 *   console.error('Governorate not found');
 * }
 * ```
 */
export const getGovernorates = (): Omit<Governorate, "subregions">[] => {
  return validatedGovernorates.map(({ subregions: _, ...rest }) => rest);
};

/**
 * Retrieves governorate details by ID
 * @param governorateId - Numeric identifier of the governorate
 * @returns Governorate object or undefined if not found
 */
export const getGovernorate = (
  governorateId: GovernorateID
): Governorate | undefined => {
  return governoratesMap.get(governorateId);
};

/**
 * Retrieves subregions (cities/districts) for a specific governorate
 * 
 * @param governorateId - Numeric ID of the governorate to retrieve subregions for
 * @returns Array of Subregion objects containing:
 * - Unique string ID
 * - Arabic name (short and long forms)
 * - English name
 * 
 * @throws {Error} If the specified governorate ID is not found
 * 
 * @remarks
 * This function provides administrative subdivisions for Egyptian governorates.
 * Typical subregions include cities and districts within each governorate.
 * 
 * @example
 * ```tsx
 * // Get Cairo's subregions
 * try {
 *   const cairoSubregions = getSubregions(1);
 *   console.log(`Cairo has ${cairoSubregions.length} subregions`);
 *   cairoSubregions.forEach(sub => {
 *     console.log(`${sub.name_en} (${sub.id})`);
 *   });
 * } catch (error) {
 *   console.error(error.message);
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Handle invalid ID
 * try {
 *   getSubregions(999);
 * } catch (error) {
 *   console.error(error.message); // "Governorate 999 not found"
 * }
 * ```
 * 
 * @see {@link Governorate} for governorate structure
 * @see {@link Subregion} for subregion object definition
 */
export const getSubregions = (governorateId: GovernorateID): Subregion[] => {
  const gov = governoratesMap.get(governorateId);
  if (!gov) throw new Error(`Governorate ${governorateId} not found`);
  return gov.subregions;
};

export const getSubregionsByGovernorateName_ar = (governorateName_ar: Governorate['name_ar']): Subregion[] => {
  const governorate = validatedGovernorates.find(gov => gov.name_ar === governorateName_ar);
  return governorate?.subregions ?? [];
};
