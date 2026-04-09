import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  AlertCircle,
  Package,
  Glasses,
  Save,
  RotateCcw,
  Loader,
} from "lucide-react";
import { Box, Slider, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useManagerProducts } from "../../../lib/hooks/useManagerProducts";
import { useProductDetail } from "../../../lib/hooks/useProductDetail";
import { useManagerLens, LensDesign } from "../../../lib/hooks/useManagerLens";

interface LensAttributeRange {
  sphMin: number;
  sphMax: number;
  cylMin: number;
  cylMax: number;
  axisMin: number;
  axisMax: number;
  addMin: number | null;
  addMax: number | null;
  index: number;
  lensDesign: string;
}

const REFRACTIVE_INDICES = [1.50, 1.56, 1.60, 1.67, 1.74];

/** ADD null/0 → chỉ SingleVision; ADD > 0 (khoảng có công suất near) → Progressive + Bifocal */
function allowsMultifocalLensDesigns(r: Pick<LensAttributeRange, "addMin" | "addMax">): boolean {
  if (r.addMin == null || r.addMax == null) return false;
  return r.addMin > 0 || r.addMax > 0;
}

function availableLensDesignsForRanges(r: Pick<LensAttributeRange, "addMin" | "addMax">): string[] {
  return allowsMultifocalLensDesigns(r) ? ["Progressive", "Bifocal"] : ["SingleVision"];
}

const DEFAULT_RANGES: LensAttributeRange = {
  sphMin: -20,
  sphMax: 12,
  cylMin: -6,
  cylMax: 6,
  axisMin: 0,
  axisMax: 180,
  addMin: null,
  addMax: null,
  index: 1.56,
  lensDesign: "SingleVision",
};

function RangeSlider({
  label,
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 0.25,
  unit = "",
  helpText = "",
}: {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  step?: number;
  unit?: string;
  helpText?: string;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
          {label}
        </Typography>
        {helpText && (
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
            {helpText}
          </Typography>
        )}
      </div>

      <div className="flex gap-4 items-center mb-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-700 block mb-2">
            Min: {minValue.toFixed(2)} {unit}
          </label>
          <Box sx={{ width: "100%" }}>
            <Slider
              value={minValue}
              onChange={(_, newValue) => {
                const v = typeof newValue === "number" ? newValue : minValue;
                onMinChange(Math.min(v, maxValue));
              }}
              min={min}
              max={max}
              step={step}
              valueLabelDisplay="auto"
              valueLabelFormat={(val) => `${val.toFixed(2)} ${unit}`}
              sx={{
                color: "#1976d2",
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.16)",
                  },
                },
                "& .MuiSlider-rail": {
                  opacity: 0.28,
                },
              }}
            />
          </Box>
        </div>

        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-700 block mb-2">
            Max: {maxValue.toFixed(2)} {unit}
          </label>
          <Box sx={{ width: "100%" }}>
            <Slider
              value={maxValue}
              onChange={(_, newValue) => {
                const v = typeof newValue === "number" ? newValue : maxValue;
                onMaxChange(Math.max(v, minValue));
              }}
              min={min}
              max={max}
              step={step}
              valueLabelDisplay="auto"
              valueLabelFormat={(val) => `${val.toFixed(2)} ${unit}`}
              sx={{
                color: "#16a34a",
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(22, 163, 74, 0.16)",
                  },
                },
                "& .MuiSlider-rail": {
                  opacity: 0.28,
                },
              }}
            />
          </Box>
        </div>
      </div>
    </div>
  );
}

export default function LensAttributesTab() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ranges, setRanges] = useState<LensAttributeRange>(DEFAULT_RANGES);

  const { products, isLoading: isLoadingProducts } = useManagerProducts({
    type: "Lens",
    pageSize: 50,
  });

  // Load the full product detail (with variants) when a product is selected
  const { product: selectedProductDetail } = useProductDetail(selectedProductId);

  // Lens hooks for attribute operations
  const { setLensVariantAttribute, isSettingAttribute, getLensVariantAttribute } = useManagerLens();

  // Fetch lens attributes from dedicated API
  const { data: lensAttribute, isLoading: isLoadingAttributes } = getLensVariantAttribute(selectedProductId, selectedVariantId);

  const lensProducts = useMemo(
    () => products.filter((p) => p.type === "Lens"),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return lensProducts;
    return lensProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term))
    );
  }, [lensProducts, searchTerm]);

  const variants = useMemo(
    () => selectedProductDetail?.variants || [],
    [selectedProductDetail]
  );

  // Load existing lens attributes from API when variant is selected
  useEffect(() => {
    if (lensAttribute) {
      const designStr =
        typeof lensAttribute.lensDesign === "string"
          ? lensAttribute.lensDesign
          : Object.keys(LensDesign).find(
              (k) => LensDesign[k as keyof typeof LensDesign] === lensAttribute.lensDesign
            ) || "SingleVision";
      setRanges({
        sphMin: lensAttribute.sphMin,
        sphMax: lensAttribute.sphMax,
        cylMin: lensAttribute.cylMin,
        cylMax: lensAttribute.cylMax,
        axisMin: lensAttribute.axisMin ?? 0,
        axisMax: lensAttribute.axisMax ?? 180,
        addMin: lensAttribute.addMin ?? null,
        addMax: lensAttribute.addMax ?? null,
        index: lensAttribute.index,
        lensDesign: designStr,
      });
    } else if (selectedVariantId && !isLoadingAttributes) {
      setRanges(DEFAULT_RANGES);
    }
  }, [lensAttribute, selectedVariantId, isLoadingAttributes]);

  // Giữ lensDesign khớp ADD: không ADD → SingleVision; có ADD > 0 → Progressive/Bifocal
  useEffect(() => {
    setRanges((prev) => {
      const allowed = availableLensDesignsForRanges(prev);
      if (allowed.includes(prev.lensDesign)) return prev;
      return {
        ...prev,
        lensDesign: allowsMultifocalLensDesigns(prev) ? "Progressive" : "SingleVision",
      };
    });
  }, [ranges.addMin, ranges.addMax]);

  const availableLensDesigns = useMemo(
    () => availableLensDesignsForRanges(ranges),
    [ranges.addMin, ranges.addMax]
  );

  const handleReset = () => {
    setRanges(DEFAULT_RANGES);
  };

  const handleSave = async () => {
    if (!selectedProductId || !selectedVariantId) {
      toast.error("Please select a product and variant");
      return;
    }

    try {
      const lensDesignKey = ranges.lensDesign as keyof typeof LensDesign;
      const lensDesignValue = LensDesign[lensDesignKey];

      await setLensVariantAttribute({
        productId: selectedProductId,
        variantId: selectedVariantId,
        dto: {
          sphMin: ranges.sphMin,
          sphMax: ranges.sphMax,
          cylMin: ranges.cylMin,
          cylMax: ranges.cylMax,
          axisMin: ranges.axisMin,
          axisMax: ranges.axisMax,
          addMin: ranges.addMin,
          addMax: ranges.addMax,
          index: ranges.index,
          lensDesign: lensDesignValue,
        },
      });

      toast.success("Lens attributes saved successfully!");
    } catch (error) {
      console.error("Error saving lens attributes:", error);
      toast.error("Failed to save lens attributes");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Product Selector */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Lens Product
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoadingProducts ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-6 h-6 animate-spin mx-auto mb-2">⏳</div>
                  Loading...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No lens products found</div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setSelectedVariantId("");
                    }}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all
                      ${
                        selectedProductId === product.id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
                      }
                    `}
                  >
                    <div className="font-medium truncate">{product.productName}</div>
                    {product.brand && (
                      <div
                        className={`text-sm mt-1 ${
                          selectedProductId === product.id ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {product.brand}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="lg:col-span-2">
          {!selectedProductId ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Select a Lens Product to configure attributes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Product Info */}
              {selectedProductDetail && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        {selectedProductDetail.productName}
                      </h3>
                      <div className="space-y-1 text-sm">
                        {selectedProductDetail.brand && (
                          <p className="text-gray-600">
                            <span className="font-medium">Brand:</span> {selectedProductDetail.brand}
                          </p>
                        )}
                        {selectedProductDetail.description && (
                          <p className="text-gray-600">
                            <span className="font-medium">Description:</span> {selectedProductDetail.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      <Glasses className="w-4 h-4" />
                      Lens
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Selector */}
              {selectedProductDetail && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Glasses className="w-4 h-4 text-indigo-600" />
                    Select Variant
                  </h4>

                  {variants.length === 0 ? (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      No variants found
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`p-2 rounded-lg text-left transition-all text-sm ${
                            selectedVariantId === variant.id
                              ? "bg-indigo-600 text-white border border-indigo-700 shadow-md"
                              : "bg-gray-50 text-gray-900 border border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="font-medium truncate">{variant.variantName || variant.sku}</div>
                          {variant.color && <div className="text-xs opacity-75">{variant.color}</div>}
                          {variant.price && (
                            <div className="text-xs mt-1 opacity-75">
                              ₫{variant.price.toLocaleString()}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Attributes Configuration Header */}
              {selectedVariantId && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  {isLoadingAttributes ? (
                    <div className="flex items-center gap-2 text-indigo-700">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Loading attributes...</span>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                        <Glasses className="w-5 h-5 text-indigo-600" />
                        Optical Attributes
                      </h4>
                      <p className="text-sm text-gray-600">
                        Configure optical parameters for this variant
                      </p>
                    </>
                  )}
                </div>
              )}

              {selectedVariantId && (
                <>
            {/* SPH Slider */}
            <RangeSlider
              label="SPH (Sphere Power)"
              min={-20}
              max={12}
              minValue={ranges.sphMin}
              maxValue={ranges.sphMax}
              onMinChange={(val) => setRanges({ ...ranges, sphMin: val })}
              onMaxChange={(val) => setRanges({ ...ranges, sphMax: val })}
              step={0.25}
              unit="D"
              helpText="Myopia (-) to Hyperopia (+)"
            />

            {/* CYL Slider */}
            <RangeSlider
              label="CYL (Cylinder Power)"
              min={-6}
              max={6}
              minValue={ranges.cylMin}
              maxValue={ranges.cylMax}
              onMinChange={(val) => setRanges({ ...ranges, cylMin: val })}
              onMaxChange={(val) => setRanges({ ...ranges, cylMax: val })}
              step={0.25}
              unit="D"
              helpText="Astigmatism correction"
            />

            {/* AXIS Slider */}
            <RangeSlider
              label="AXIS (Astigmatism Axis)"
              min={0}
              max={180}
              minValue={ranges.axisMin}
              maxValue={ranges.axisMax}
              onMinChange={(val) => setRanges({ ...ranges, axisMin: val })}
              onMaxChange={(val) => setRanges({ ...ranges, axisMax: val })}
              step={1}
              unit="°"
              helpText="Axis orientation"
            />

            {/* ADD Slider - Optional */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="enableAdd"
                  checked={ranges.addMin !== null}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRanges({ ...ranges, addMin: 0.5, addMax: 3.5 });
                    } else {
                      setRanges({ ...ranges, addMin: null, addMax: null });
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enableAdd" className="font-semibold text-sm">
                  Progressive/Bifocal (ADD)
                </label>
              </div>

              {ranges.addMin !== null && ranges.addMax !== null && (
                <RangeSlider
                  label="ADD (Near Addition)"
                  min={0}
                  max={4}
                  minValue={ranges.addMin}
                  maxValue={ranges.addMax}
                  onMinChange={(val) => setRanges({ ...ranges, addMin: val })}
                  onMaxChange={(val) => setRanges({ ...ranges, addMax: val })}
                  step={0.25}
                  unit="D"
                  helpText="Additional power for near vision"
                />
              )}
            </div>

            {/* Lens Design Selection — lọc theo ADD: null/0 → SingleVision; ADD > 0 → Progressive, Bifocal */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Lens Design Type
              </label>
              <p className="text-xs text-gray-500 mb-3">
                {allowsMultifocalLensDesigns(ranges)
                  ? "ADD range is set — choose Progressive or Bifocal."
                  : "No ADD (or ADD = 0) — only Single Vision applies."}
              </p>
              <div
                className={`grid gap-2 ${
                  availableLensDesigns.length <= 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {availableLensDesigns.map((design) => (
                  <button
                    key={design}
                    type="button"
                    onClick={() =>
                      setRanges({ ...ranges, lensDesign: design })
                    }
                    className={`py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                      ranges.lensDesign === design
                        ? "bg-indigo-600 text-white"
                        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400"
                    }`}
                  >
                    {design}
                  </button>
                ))}
              </div>
            </div>

            {/* Refractive Index Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700 block mb-3">
                Refractive Index
              </label>
              <div className="grid grid-cols-5 gap-2">
                {REFRACTIVE_INDICES.map((index) => (
                  <button
                    key={index}
                    onClick={() => setRanges({ ...ranges, index })}
                    className={`py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                      ranges.index === index
                        ? "bg-indigo-600 text-white"
                        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400"
                    }`}
                  >
                    {index}
                  </button>
                ))}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSettingAttribute || isLoadingAttributes}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors font-medium ${
                  isSettingAttribute || isLoadingAttributes
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSettingAttribute ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isSettingAttribute || isLoadingAttributes}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors font-medium ${
                  isSettingAttribute || isLoadingAttributes
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
