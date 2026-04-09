import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Loader2,
  Package,
  Link as LinkIcon,
  Plus,
  Trash2,
  Check,
  X,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { useManagerProducts } from "../../../lib/hooks/useManagerProducts";
import { useManagerLens } from "../../../lib/hooks/useManagerLens";
import { useCategories } from "../../../lib/hooks/useProducts";

export default function FrameLensCompatibilityTab() {
  const [selectedFrameId, setSelectedFrameId] = useState<string>("");
  const [searchFrameTerm, setSearchFrameTerm] = useState("");
  const [searchLensTerm, setSearchLensTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { categories, isLoading: isLoadingCategories } = useCategories();
  
  // Find Eyeglasses category ID
  const eyeglassesCategoryId = useMemo(() => {
    const eyeglassesCategory = categories.find(c => 
      c.name.toLowerCase() === "eyeglasses" || c.slug.toLowerCase() === "eyeglasses"
    );
    return eyeglassesCategory?.id || "";
  }, [categories]);

  const { products: frameProducts, isLoading: isLoadingFrames, error: frameError } = useManagerProducts({
    type: "Frame",
    categoryIds: eyeglassesCategoryId ? [eyeglassesCategoryId] : [],
    pageSize: 50,
  });

  const { products: lensProducts, isLoading: isLoadingLenses } = useManagerProducts({
    type: "Lens",
    pageSize: 50,
  });

  const isLoadingProducts = isLoadingCategories || isLoadingFrames || isLoadingLenses;
  const error = frameError;

  const {
    getCompatibleLenses,
    addCompatibleLens,
    isAddingCompatibleLens,
    removeCompatibleLens,
    isRemovingCompatibleLens,
  } = useManagerLens();

  const selectedFrame = useMemo(
    () => frameProducts.find((p) => p.id === selectedFrameId),
    [frameProducts, selectedFrameId]
  );

  const filteredFrames = useMemo(
    () =>
      frameProducts.filter((p) =>
        p.productName.toLowerCase().includes(searchFrameTerm.toLowerCase())
      ),
    [frameProducts, searchFrameTerm]
  );

  const {
    data: compatibleLenses,
    isLoading: isLoadingCompatible,
    isError: isCompatibleError,
    error: compatibleError,
  } = getCompatibleLenses(selectedFrameId);

  const handleAddCompatibleLens = async (lensProductId: string) => {
    if (!selectedFrameId) return;
    try {
      await addCompatibleLens({ frameProductId: selectedFrameId, lensProductId });
      toast.success("Compatible lens added successfully");
      setShowAddModal(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to add compatible lens");
    }
  };

  const handleRemoveCompatibleLens = async (lensProductId: string) => {
    if (!selectedFrameId) return;
    if (!confirm("Are you sure you want to remove this link?")) return;
    try {
      await removeCompatibleLens({ frameProductId: selectedFrameId, lensProductId });
      toast.success("Compatible lens removed successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to remove compatible lens");
    }
  };

  const safeCompatibleLenses = compatibleLenses ?? [];

  const availableLenses = useMemo(() => {
    if (isCompatibleError || isLoadingCompatible) return [];
    const compatibleIds = new Set(safeCompatibleLenses.map((l) => l.lensProductId));
    return lensProducts.filter((l) => !compatibleIds.has(l.id));
  }, [lensProducts, safeCompatibleLenses, isCompatibleError, isLoadingCompatible]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Frame-Lens Compatibility</p>
          <p className="text-blue-800">
            Link compatible lens products with each frame product. Customers can only
            select linked lenses when purchasing a frame.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Frame Product
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search frame..."
                value={searchFrameTerm}
                onChange={(e) => setSearchFrameTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">Failed to load data</div>
                  <p className="text-sm text-gray-600">{error.message || "Unable to connect to API"}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : isLoadingProducts ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : filteredFrames.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    {searchFrameTerm ? "No frames found" : "No frame products yet"}
                  </p>
                  {!searchFrameTerm && (
                    <p className="text-gray-500 text-sm mt-2">
                      Create a frame product in the Products tab first
                    </p>
                  )}
                </div>
              ) : (
                filteredFrames.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedFrameId(product.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all
                      ${
                        selectedFrameId === product.id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
                      }
                    `}
                  >
                    <div className="font-medium truncate">{product.productName}</div>
                    {product.brand && (
                      <div
                        className={`text-sm mt-1 ${
                          selectedFrameId === product.id ? "text-blue-100" : "text-gray-500"
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

        <div className="lg:col-span-2">
          {!selectedFrameId ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Select a Frame Product to manage compatible lenses
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedFrame?.productName}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {safeCompatibleLenses.length} compatible lens product(s)
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Lens
                </button>
              </div>

              {isLoadingCompatible ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                </div>
              ) : isCompatibleError ? (
                <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
                  <p className="text-red-700 font-medium">Failed to load compatible lenses</p>
                  <p className="text-red-500 text-sm mt-1">{(compatibleError as Error)?.message || "Unknown error"}</p>
                </div>
              ) : safeCompatibleLenses.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                  <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No lenses linked yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Click "Add Lens" to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {safeCompatibleLenses.map((lens) => (
                    <motion.div
                      key={lens.lensProductId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {lens.lensProductName}
                        </h4>
                        {lens.brand && (
                          <p className="text-sm text-gray-600 mt-1">{lens.brand}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCompatibleLens(lens.lensProductId)}
                        disabled={isRemovingCompatibleLens}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddLensModal
            availableLenses={availableLenses}
            searchTerm={searchLensTerm}
            onSearchChange={setSearchLensTerm}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddCompatibleLens}
            isAdding={isAddingCompatibleLens}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddLensModal({
  availableLenses,
  searchTerm,
  onSearchChange,
  onClose,
  onAdd,
  isAdding,
}: {
  availableLenses: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose: () => void;
  onAdd: (lensProductId: string) => void;
  isAdding: boolean;
}) {
  const filteredLenses = useMemo(
    () =>
      availableLenses.filter((l) =>
        l.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [availableLenses, searchTerm]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Add Compatible Lens</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lens product..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredLenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {availableLenses.length === 0
                ? "All lenses have been linked"
                : "No matching lenses found"}
            </div>
          ) : (
            filteredLenses.map((lens) => (
              <button
                key={lens.id}
                onClick={() => onAdd(lens.id)}
                disabled={isAdding}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-gray-900">{lens.productName}</div>
                  {lens.brand && (
                    <div className="text-sm text-gray-600 mt-1">{lens.brand}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <Check className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
