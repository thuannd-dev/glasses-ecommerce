import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  DollarSign,
  Check,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Package,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";
import { useManagerProducts } from "../../../lib/hooks/useManagerProducts";
import { formatMoney } from "../../../lib/utils/format";
import {
  useManagerLens,
  type AddLensCoatingOptionDto,
  type UpdateLensCoatingOptionDto,
  type LensCoatingOption,
} from "../../../lib/hooks/useManagerLens";

export default function CoatingOptionsTab() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoating, setEditingCoating] = useState<LensCoatingOption | null>(null);

  const { products, isLoading: isLoadingProducts } = useManagerProducts({
    type: "Lens",
    pageSize: 50,
  });

  const {
    getLensCoatingOptions,
    addCoatingOption,
    isAddingCoating,
    updateCoatingOption,
    isUpdatingCoating,
    deleteCoatingOption,
  } = useManagerLens();

  const lensProducts = useMemo(
    () => products.filter((p) => p.type === "Lens"),
    [products]
  );

  const selectedProduct = useMemo(
    () => lensProducts.find((p) => p.id === selectedProductId),
    [lensProducts, selectedProductId]
  );

  const handleAddCoating = async (dto: AddLensCoatingOptionDto) => {
    if (!selectedProductId) {
      toast.error("Please select a Lens Product");
      return;
    }
    try {
      await addCoatingOption({ productId: selectedProductId, dto });
      toast.success("Coating option added successfully");
      setShowAddModal(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to add coating option");
    }
  };

  const handleUpdateCoating = async (coatingId: string, dto: UpdateLensCoatingOptionDto) => {
    if (!selectedProductId) return;
    try {
      await updateCoatingOption({ productId: selectedProductId, coatingId, dto });
      toast.success("Coating option updated successfully");
      setEditingCoating(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update coating option");
    }
  };

  const handleDeleteCoating = async (coatingId: string) => {
    if (!selectedProductId) return;
    if (!confirm("Are you sure you want to delete this coating option?")) return;
    try {
      await deleteCoatingOption({ productId: selectedProductId, coatingId });
      toast.success("Coating option deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete coating option");
    }
  };

  const filteredProducts = useMemo(
    () =>
      lensProducts.filter((p) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [lensProducts, searchTerm]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Select Lens Product
            </h3>
            <div className="relative mb-3">
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
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No lens products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
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

        <div className="lg:col-span-2">
          {!selectedProductId ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Select a Lens Product to manage coating options
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedProduct?.productName}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage coating options for this product
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Coating
                </button>
              </div>

              <CoatingOptionsList
                productId={selectedProductId}
                getLensCoatingOptions={getLensCoatingOptions}
                onEdit={setEditingCoating}
                onDelete={handleDeleteCoating}
                onToggleActive={(id, isActive) =>
                  handleUpdateCoating(id, { isActive: !isActive })
                }
              />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <CoatingModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddCoating}
            isLoading={isAddingCoating}
          />
        )}
        {editingCoating && (
          <CoatingModal
            coating={editingCoating}
            onClose={() => setEditingCoating(null)}
            onSubmit={(dto) => handleUpdateCoating(editingCoating.id, dto)}
            isLoading={isUpdatingCoating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CoatingOptionsList({
  productId,
  getLensCoatingOptions,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  productId: string;
  getLensCoatingOptions: (productId: string) => any;
  onEdit: (coating: LensCoatingOption) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}) {
  const { data: coatings = [], isLoading, isError, error } = getLensCoatingOptions(productId);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
        <p className="text-red-700 font-medium">Failed to load coating options</p>
        <p className="text-red-500 text-sm mt-1">{(error as Error)?.message || "Unknown error"}</p>
      </div>
    );
  }

  if (!coatings || coatings.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
        <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No coating options yet</p>
        <p className="text-gray-500 text-sm mt-2">Click "Add Coating" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {coatings.map((coating: LensCoatingOption) => (
        <motion.div
          key={coating.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {coating.coatingName}
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    coating.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {coating.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {coating.description && (
                <p className="text-gray-600 mt-2">{coating.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  +{formatMoney(coating.extraPrice)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleActive(coating.id, coating.isActive)}
                className={`p-2 rounded-lg transition-colors ${
                  coating.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={coating.isActive ? "Deactivate" : "Activate"}
              >
                {coating.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button
                onClick={() => onEdit(coating)}
                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(coating.id)}
                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CoatingModal({
  coating,
  onClose,
  onSubmit,
  isLoading,
}: {
  coating?: LensCoatingOption;
  onClose: () => void;
  onSubmit: (dto: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    coatingName: coating?.coatingName || "",
    description: coating?.description || "",
    extraPrice: coating?.extraPrice || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {coating ? "Update Coating" : "Add Coating Option"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coating Name *
            </label>
            <input
              type="text"
              required
              value={formData.coatingName}
              onChange={(e) => setFormData({ ...formData, coatingName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. UV Protection, Blue Light Filter..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Detailed description of the coating..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Price (USD) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.extraPrice}
              onChange={(e) =>
                setFormData({ ...formData, extraPrice: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {coating ? "Update" : "Add New"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
