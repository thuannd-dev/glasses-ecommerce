import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useProducts, useCategories, useBrands } from "../../../lib/hooks/useProducts";
import { useDebouncedValue } from "../../../lib/hooks/useDebouncedValue";
import type { FiltersState, SortKey, Product } from "../types";

const PAGE_SIZE = 8;
const PRICE_DEBOUNCE_MS = 400;

function defaultFilters(initialKeyword: string): FiltersState {
  return {
    keyword: initialKeyword,
    glassesTypes: [],
    shapes: [],
    colors: [],
    frameSizes: [],
    materials: [],
    genders: [],
    minPrice: null,
    maxPrice: null,
    brand: null,
  };
}

export function useCollectionPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get("search") ?? "";

  const [sort, setSort] = useState<SortKey>("featured");
  const [filters, setFilters] = useState<FiltersState>(() => defaultFilters(initialKeyword));
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(false);

  const topRef = useRef<HTMLDivElement | null>(null);
  const prevPageRef = useRef(page);

  const debouncedMinPrice = useDebouncedValue(filters.minPrice, PRICE_DEBOUNCE_MS);
  const debouncedMaxPrice = useDebouncedValue(filters.maxPrice, PRICE_DEBOUNCE_MS);

  const sortBy = sort === "featured" ? 0 : 1;
  const sortOrder = sort === "priceDesc" ? 1 : 0;

  const { categories } = useCategories();
  const { brands: brandsFromApi } = useBrands();
  const categoriesList = Array.isArray(categories) ? categories : [];
  const brandsList = Array.isArray(brandsFromApi) ? brandsFromApi : [];

  const categorySlug = (category || "").toLowerCase();

  // Tính ra danh sách categoryIds để gửi lên API, dựa trên slug trên URL và filters.glassesTypes
  let categoryIds: string[] | undefined;

  if (categorySlug !== "all") {
    const hasGlassesTypeFilter = filters.glassesTypes.length > 0;

    const wantedNamesOrSlugs = hasGlassesTypeFilter
      ? filters.glassesTypes.map((t) => String(t).toLowerCase())
      : categorySlug
        ? [categorySlug]
        : [];

    if (wantedNamesOrSlugs.length > 0 && categoriesList.length > 0) {
      const matched = categoriesList.filter((c) => {
        const nameLower = c.name.toLowerCase();
        const slugLower = c.slug.toLowerCase();
        return (
          wantedNamesOrSlugs.includes(nameLower) || wantedNamesOrSlugs.includes(slugLower)
        );
      });

      if (matched.length > 0) {
        categoryIds = matched.map((c) => c.id);
      } else if (categorySlug) {
        const fallbackSlug =
          categorySlug === "glasses"
            ? "eyeglasses"
            : categorySlug === "fashion"
              ? "sunglasses"
              : categorySlug;

        const fallback = categoriesList.find((c) => {
          const nameLower = c.name.toLowerCase();
          const slugLower = c.slug.toLowerCase();
          return nameLower === fallbackSlug || slugLower === fallbackSlug;
        });

        categoryIds = fallback ? [fallback.id] : undefined;
      }
    }
  }

  useEffect(() => {
    if (categorySlug === "all") {
      setFilters((prev) =>
        prev.glassesTypes.length === 0 ? prev : { ...prev, glassesTypes: [] }
      );
    } else if (categorySlug === "sunglasses" || categorySlug === "eyeglasses") {
      setFilters((prev) =>
        prev.glassesTypes.length === 1 && prev.glassesTypes[0] === categorySlug
          ? prev
          : { ...prev, glassesTypes: [categorySlug] }
      );
    } else {
      setFilters((prev) =>
        prev.glassesTypes.length === 0 ? prev : { ...prev, glassesTypes: [] }
      );
    }
  }, [categorySlug]);

  const productsParams = {
    pageSize: PAGE_SIZE,
    categoryIds,
    search: filters.keyword.trim() || undefined,
    minPrice: debouncedMinPrice ?? undefined,
    maxPrice: debouncedMaxPrice ?? undefined,
    brand: filters.brand ?? undefined,
    sortBy,
    sortOrder,
  };

  const hasCategoryIds = !!(categoryIds && categoryIds.length > 0);
  const hasGlassesTypeFilter = filters.glassesTypes.length > 0;
  const isAllOrRootCategory = categorySlug === "all" || !categorySlug;

  const enableQuery =
    hasCategoryIds || (!hasGlassesTypeFilter && isAllOrRootCategory);

  const {
    products: apiProducts,
    totalCount: totalItems,
    isLoading,
  } = useProducts(
    { ...productsParams, pageNumber: page },
    {
      enabled: enableQuery,
    }
  );

  const rawProducts: Product[] = Array.isArray(apiProducts) ? apiProducts : [];
  const pageProducts =
    hasGlassesTypeFilter && rawProducts.length > 0
      ? rawProducts.filter(
          (p) => p.glassesType && filters.glassesTypes.includes(p.glassesType)
        )
      : rawProducts;

  const isFirstPage = page === 1;
  const isShortFirstPage = pageProducts.length < PAGE_SIZE;

  const needMergePage2 =
    hasCategoryIds && isFirstPage && isShortFirstPage && totalItems > pageProducts.length;

  const { products: apiPage2 } = useProducts(
    { ...productsParams, pageNumber: 2 },
    { enabled: needMergePage2 }
  );

  const page2Filtered: Product[] =
    needMergePage2 && filters.glassesTypes.length > 0 && Array.isArray(apiPage2)
      ? apiPage2.filter(
          (p) => p.glassesType && filters.glassesTypes.includes(p.glassesType)
        )
      : [];

  const mergedProducts =
    needMergePage2 && page2Filtered.length > 0
      ? [...pageProducts, ...page2Filtered]
      : pageProducts;

  const effectiveTotal =
    needMergePage2 && mergedProducts.length > 0
      ? mergedProducts.length
      : hasCategoryIds && isFirstPage && isShortFirstPage
        ? pageProducts.length
        : totalItems;

  const totalPages =
    effectiveTotal <= 0 ? 0 : Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));
  const showPagination = totalPages > 1;
  const productsToShow = needMergePage2 ? mergedProducts : pageProducts;

  useEffect(() => {
    const urlKeyword = searchParams.get("search") ?? "";
    setFilters((prev) =>
      prev.keyword === urlKeyword ? prev : { ...prev, keyword: urlKeyword }
    );
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    category,
    sort,
    filters.keyword,
    filters.brand,
    filters.glassesTypes,
    filters.shapes,
    filters.colors,
    filters.frameSizes,
    filters.materials,
    filters.genders,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [page]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [categorySlug]);

  const handleChangePage = (nextPage: number) => setPage(nextPage);

  const activeFilterCount =
    filters.glassesTypes.length +
    filters.shapes.length +
    filters.colors.length +
    filters.frameSizes.length +
    filters.materials.length +
    filters.genders.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.brand ? 1 : 0);

  return {
    // refs
    topRef,
    // state
    sort,
    setSort,
    filters,
    setFilters,
    page,
    openFilter,
    setOpenFilter,
    // data
    productsToShow,
    categoriesList,
    brandsList,
    isLoading,
    totalPages,
    effectiveTotal,
    showPagination,
    PAGE_SIZE,
    activeFilterCount,
    // handlers
    handleChangePage,
    defaultFilters: (keyword: string) => defaultFilters(keyword),
    initialKeyword,
  };
}
