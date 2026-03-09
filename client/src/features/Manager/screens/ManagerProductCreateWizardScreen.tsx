import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

import agent from "../../../lib/api/agent";
import { useCategories } from "../../../lib/hooks/useProducts";
import { useLookups } from "../../../lib/hooks/useLookups";
import {
  type AddProductImageDto,
  type CreateProductVariantDto,
  useManagerProducts,
} from "../../../lib/hooks/useManagerProducts";

type WizardStepId = 0 | 1 | 2 | 3;

type ManagerProductDetailResponse = {
  id: string;
  productName: string;
  type: number;
  description: string | null;
  brand: string | null;
  status: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
    modelUrl?: string | null;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    variantName?: string | null;
    color?: string | null;
    size?: string | null;
    material?: string | null;
    frameWidth?: number | null;
    lensWidth?: number | null;
    bridgeWidth?: number | null;
    templeLength?: number | null;
    price?: number;
    compareAtPrice?: number | null;
    isActive?: boolean;
    isPreOrder?: boolean;
    quantityAvailable?: number;
    images?: Array<{
      id: string;
      imageUrl: string;
      altText: string | null;
      displayOrder: number;
      modelUrl?: string | null;
    }>;
  }>;
};

type PendingImage = { id: string; file: File; url: string };

type VariantDraft = CreateProductVariantDto & {
  _tempId: string;
  quantityAvailable: number;
  pendingImages: PendingImage[];
};

type WizardLocalState = {
  productId: string;
  step: WizardStepId;
  savedSteps: Record<WizardStepId, boolean>;
};

const STORAGE_KEY = "manager_create_product_wizard";

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        "h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700"
      }
    />
  );
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-zinc-900">{title}</div>
            {description ? <div className="mt-1 text-sm text-zinc-600">{description}</div> : null}
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getAxiosMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;
    const maybeObj = (data && typeof data === "object" ? (data as Record<string, unknown>) : null) ?? null;
    const detail = typeof maybeObj?.detail === "string" ? maybeObj.detail : null;
    const title = typeof maybeObj?.title === "string" ? maybeObj.title : null;
    const message = typeof maybeObj?.message === "string" ? maybeObj.message : null;
    return (
      (typeof data === "string" && data) ||
      detail ||
      title ||
      message ||
      err.message ||
      fallback
    );
  }

  return err instanceof Error && err.message ? err.message : fallback;
}

export default function ManagerProductCreateWizardScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { categories } = useCategories();
  const { data: lookups } = useLookups();

  const [step, setStep] = useState<WizardStepId>(0);
  const [productId, setProductId] = useState<string | null>(null);

  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [pendingResumeState, setPendingResumeState] = useState<WizardLocalState | null>(null);

  const [savedSteps, setSavedSteps] = useState<Record<WizardStepId, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  // Step 1: Basic info
  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [type, setType] = useState<number | "">("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  const [isDirty, setIsDirty] = useState<Record<WizardStepId, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const [submittedStep0, setSubmittedStep0] = useState(false);
  const [submittedStep2, setSubmittedStep2] = useState(false);
  const [touchedStep0, setTouchedStep0] = useState<Record<string, boolean>>({});
  const touchField0 = (field: string) => setTouchedStep0((prev) => ({ ...prev, [field]: true }));
  const [touchedVariants, setTouchedVariants] = useState<Record<string, Record<string, boolean>>>({});
  const touchVariantField = (tempId: string, field: string) =>
    setTouchedVariants((prev) => ({ ...prev, [tempId]: { ...prev[tempId], [field]: true } }));

  // Step 2: Images
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; url: string }>>([]);

  // Step 3: Variants
  const [newVariants, setNewVariants] = useState<VariantDraft[]>([]);

  const steps = useMemo(
    () => [
      { id: 0 as const, label: "Basic Info" },
      { id: 1 as const, label: "Images" },
      { id: 2 as const, label: "Variants" },
      { id: 3 as const, label: "Confirm" },
    ],
    []
  );

  const productDetailQuery = useQuery<ManagerProductDetailResponse>({
    queryKey: productId ? ["manager-product-detail", productId] : ["manager-product-detail", "__noid__"],
    enabled: !!productId,
    queryFn: async () => {
      const res = await agent.get<ManagerProductDetailResponse>(`/products/${productId}`);
      return res.data as ManagerProductDetailResponse;
    },
  });

  const { updateProduct, addProductImage, deleteProductImage, createProductVariant, addVariantImage } = useManagerProducts();

  const createProductMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        categoryId: categoryId.trim(),
        productName: productName.trim(),
        type: Number(type),
        description: description.trim() ? description.trim() : null,
        brand: brand.trim() ? brand.trim() : null,
      };

      const res = await agent.post<string>("/manager/products", payload);
      return res.data;
    },
    onSuccess: async (id) => {
      setProductId(id);
      await queryClient.invalidateQueries({ queryKey: ["manager-products"] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await agent.post<{ url: string; publicId: string }>("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [confirmPreviewIndex, setConfirmPreviewIndex] = useState(0);
  const [confirmLightboxOpen, setConfirmLightboxOpen] = useState(false);

  const typeOptions = useMemo(() => {
    const list: string[] = lookups?.productType ?? [];
    // Index mapping is enum ordinal. Backend validator forbids Unknown (0) for create.
    return list
      .map((label, idx) => ({ value: idx, label }))
      .filter((x) => x.value !== 0);
  }, [lookups?.productType]);

  const persistState = (next: Partial<WizardLocalState>) => {
    const current: WizardLocalState | null = safeParseJson<WizardLocalState>(localStorage.getItem(STORAGE_KEY));
    const merged: WizardLocalState | null = {
      productId: next.productId ?? current?.productId ?? "",
      step: next.step ?? current?.step ?? 0,
      savedSteps: next.savedSteps ?? current?.savedSteps ?? { 0: false, 1: false, 2: false, 3: false },
    };

    if (!merged.productId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  const clearPersistedState = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    const s = safeParseJson<WizardLocalState>(localStorage.getItem(STORAGE_KEY));
    if (s?.productId) {
      setPendingResumeState(s);
      setResumeDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!productDetailQuery.data) return;
    if (!pendingResumeState?.productId) return;

    const p = productDetailQuery.data;
    setCategoryId(p.category?.id ?? "");
    setProductName(p.productName ?? "");
    setType(typeof p.type === "number" ? p.type : "");
    setBrand(p.brand ?? "");
    setDescription(p.description ?? "");

    setIsDirty({ 0: false, 1: false, 2: false, 3: false });
  }, [productDetailQuery.data, pendingResumeState?.productId]);

  const basicInfoErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!categoryId.trim()) errors.categoryId = "Category is required";

    if (!productName.trim()) errors.productName = "Product name is required";
    if (productName.trim().length > 200) errors.productName = "Product name must not exceed 200 characters";

    if (type === "" || Number.isNaN(Number(type))) errors.type = "Type is required";
    if (Number(type) === 0) errors.type = "Type cannot be Unknown";

    if (!brand.trim()) errors.brand = "Brand is required";
    else if (brand.trim().length > 100) errors.brand = "Brand must not exceed 100 characters";
    if (description.trim().length > 1000) errors.description = "Description must not exceed 1000 characters";

    return errors;
  }, [brand, categoryId, description, productName, type]);

  const variantsErrors = useMemo(() => {
    const errors: string[] = [];

    if (newVariants.length === 0) {
      return errors;
    }

    const skus = newVariants.map((v) => v.sku.trim()).filter(Boolean);
    const unique = new Set(skus);
    if (unique.size !== skus.length) errors.push("Variant SKU must be unique");

    newVariants.forEach((v, idx) => {
      if (!v.sku.trim()) errors.push(`Variant #${idx + 1}: SKU is required`);
      if (v.sku.trim().length > 100) errors.push(`Variant #${idx + 1}: SKU must not exceed 100 characters`);
      if (!v.variantName || !String(v.variantName).trim()) errors.push(`Variant #${idx + 1}: Variant name is required`);
      if (!v.color || !String(v.color).trim()) errors.push(`Variant #${idx + 1}: Color is required`);
      if (!v.size || !String(v.size).trim()) errors.push(`Variant #${idx + 1}: Size is required`);
      if (!v.material || !String(v.material).trim()) errors.push(`Variant #${idx + 1}: Material is required`);
      if (v.pendingImages.length === 0) errors.push(`Variant #${idx + 1}: At least 1 image is required`);
      if (v.price == null || Number.isNaN(v.price) || v.price < 0) errors.push(`Variant #${idx + 1}: Price must be >= 0`);
      if (v.compareAtPrice != null && v.compareAtPrice < v.price) errors.push(`Variant #${idx + 1}: Compare-at must be >= price`);
      if (v.frameWidth != null && v.frameWidth <= 0) errors.push(`Variant #${idx + 1}: Frame width must be > 0`);
      if (v.lensWidth != null && v.lensWidth <= 0) errors.push(`Variant #${idx + 1}: Lens width must be > 0`);
      if (v.bridgeWidth != null && v.bridgeWidth <= 0) errors.push(`Variant #${idx + 1}: Bridge width must be > 0`);
      if (v.templeLength != null && v.templeLength <= 0) errors.push(`Variant #${idx + 1}: Temple length must be > 0`);
      if (v.quantityAvailable < 0) errors.push(`Variant #${idx + 1}: Quantity must be >= 0`);
    });

    return errors;
  }, [newVariants]);

  const canNext = useMemo(() => {
    if (!savedSteps[step]) return false;
    if (isDirty[step]) return false;
    return true;
  }, [isDirty, savedSteps, step]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [pendingImages]);

  const stepMeta = useMemo(() => {
    const icons: Record<WizardStepId, React.ReactNode> = {
      0: <Package className="w-5 h-5" />,
      1: <ImageIcon className="w-5 h-5" />,
      2: <Layers className="w-5 h-5" />,
      3: <Send className="w-5 h-5" />,
    };
    return steps.map((s) => ({
      ...s,
      icon: icons[s.id],
    }));
  }, [steps]);

  const handleSaveProgress = async () => {
    try {
      if (step === 0) {
        setSubmittedStep0(true);
        if (Object.keys(basicInfoErrors).length > 0) {
          toast.error("Please fix validation errors before saving");
          return;
        }

        if (!productId) {
          const id = await createProductMutation.mutateAsync();
          setProductId(id);
          const nextSaved = { ...savedSteps, 0: true };
          setSavedSteps(nextSaved);
          setIsDirty((prev) => ({ ...prev, 0: false }));
          persistState({ productId: id, step, savedSteps: nextSaved });
          toast.success("Progress saved (Draft product created)");
          return;
        }

        const dto: Record<string, unknown> = {
          categoryId: categoryId.trim(),
          productName: productName.trim(),
          description: description.trim() ? description.trim() : null,
          brand: brand.trim() ? brand.trim() : null,
        };

        await updateProduct({ id: productId, productData: dto });
        const nextSaved = { ...savedSteps, 0: true };
        setSavedSteps(nextSaved);
        setIsDirty((prev) => ({ ...prev, 0: false }));
        persistState({ productId, step, savedSteps: nextSaved });
        toast.success("Progress saved");
        return;
      }

      if (step === 1) {
        if (!productId) {
          toast.error("Please save Basic Info first");
          return;
        }

        const existingCount = (productDetailQuery.data?.images?.length ?? 0) as number;

        for (let i = 0; i < pendingImages.length; i++) {
          const file = pendingImages[i].file;
          const uploaded = await uploadImageMutation.mutateAsync(file);
          const imageDto: AddProductImageDto = {
            imageUrl: uploaded.url,
            altText: null,
            displayOrder: existingCount + i,
            modelUrl: null,
          };
          await addProductImage({ productId, image: imageDto });
        }

        pendingImages.forEach((p) => URL.revokeObjectURL(p.url));
        setPendingImages([]);
        await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", productId] });

        const nextSaved = { ...savedSteps, 1: true };
        setSavedSteps(nextSaved);
        setIsDirty((prev) => ({ ...prev, 1: false }));
        persistState({ productId, step, savedSteps: nextSaved });
        toast.success("Images saved");
        return;
      }

      if (step === 2) {
        setSubmittedStep2(true);
        if (!productId) {
          toast.error("Please save Basic Info first");
          return;
        }

        if (variantsErrors.length > 0) {
          toast.error("Please fix validation errors before saving");
          return;
        }

        for (const v of newVariants) {
          const payload: CreateProductVariantDto = {
            sku: v.sku.trim(),
            variantName: v.variantName,
            color: v.color,
            size: v.size,
            material: v.material,
            frameWidth: v.frameWidth,
            lensWidth: v.lensWidth,
            bridgeWidth: v.bridgeWidth,
            templeLength: v.templeLength,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            isPreOrder: v.isPreOrder,
          };

          const variantId = await createProductVariant({ productId, variant: payload });

          for (let i = 0; i < v.pendingImages.length; i++) {
            const file = v.pendingImages[i].file;
            const uploaded = await uploadImageMutation.mutateAsync(file);
            await addVariantImage({
              productId,
              variantId,
              image: {
                imageUrl: uploaded.url,
                altText: null,
                displayOrder: i,
                modelUrl: null,
              },
            });
          }
        }

        newVariants.forEach((v) => v.pendingImages.forEach((p) => URL.revokeObjectURL(p.url)));
        setNewVariants([]);
        await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", productId] });

        const nextSaved = { ...savedSteps, 2: true };
        setSavedSteps(nextSaved);
        setIsDirty((prev) => ({ ...prev, 2: false }));
        persistState({ productId, step, savedSteps: nextSaved });
        toast.success("Variants saved");
        return;
      }

      if (step === 3) {
        const nextSaved = { ...savedSteps, 3: true };
        setSavedSteps(nextSaved);
        persistState({ productId: productId ?? "", step, savedSteps: nextSaved });
        toast.success("Confirmation saved");
        return;
      }
    } catch (err) {
      toast.error(getAxiosMessage(err, "Failed to save progress"));
    }
  };

  const handleNext = () => {
    if (!canNext) {
      toast.info("Please save progress before continuing");
      return;
    }
    setStep((s) => {
      const next = Math.min(3, s + 1);
      return next as WizardStepId;
    });
    persistState({ productId: productId ?? "", step: (step + 1) as WizardStepId, savedSteps });
  };

  const handleBack = () => {
    setStep((s) => {
      const next = Math.max(0, s - 1);
      return next as WizardStepId;
    });
    persistState({ productId: productId ?? "", step: (step - 1) as WizardStepId, savedSteps });
  };

  const handleComplete = async (mode: "publish" | "draft") => {
    if (!productId) {
      toast.error("Missing productId");
      return;
    }

    setIsPublishing(true);
    try {
      if (mode === "publish") {
        await updateProduct({ id: productId, productData: { status: 0 } });
        toast.success("Product published successfully");
      } else {
        toast.success("Product saved as draft");
      }

      clearPersistedState();
      await queryClient.invalidateQueries({ queryKey: ["manager-products"] });
      navigate(mode === "draft" ? "/manager/products?status=Draft" : "/manager/products");
    } catch (err) {
      toast.error(getAxiosMessage(err, "Failed to complete product"));
    } finally {
      setIsPublishing(false);
      setPublishDialogOpen(false);
    }
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <div className="space-y-8 py-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Basic information</h2>
            <p className="mt-1 text-sm text-zinc-600">Start by adding the main product details. Save progress to create a draft.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsDirty((prev) => ({ ...prev, 0: true }));
                }}
                onBlur={() => touchField0('categoryId')}
                className={`w-full px-4 py-2 rounded-lg border ${(touchedStep0.categoryId || submittedStep0) && basicInfoErrors.categoryId ? 'border-red-400' : 'border-zinc-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {(touchedStep0.categoryId || submittedStep0) && basicInfoErrors.categoryId ? <p className="text-xs text-red-600">{basicInfoErrors.categoryId}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value === '' ? '' : Number(e.target.value));
                  setIsDirty((prev) => ({ ...prev, 0: true }));
                }}
                disabled={!!productId}
                onBlur={() => touchField0('type')}
                className={`w-full px-4 py-2 rounded-lg border ${(touchedStep0.type || submittedStep0) && basicInfoErrors.type ? 'border-red-400' : 'border-zinc-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:bg-zinc-50 disabled:text-zinc-500`}
              >
                <option value="">Select type</option>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {productId ? <p className="text-xs text-zinc-500">Type cannot be changed after Draft is created.</p> : null}
              {(touchedStep0.type || submittedStep0) && basicInfoErrors.type ? <p className="text-xs text-red-600">{basicInfoErrors.type}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Product name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setIsDirty((prev) => ({ ...prev, 0: true }));
              }}
              maxLength={200}
              onBlur={() => touchField0('productName')}
              className={`w-full px-4 py-2 rounded-lg border ${(touchedStep0.productName || submittedStep0) && basicInfoErrors.productName ? 'border-red-400' : 'border-zinc-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              placeholder="e.g. Demo Glass 10"
            />
            {(touchedStep0.productName || submittedStep0) && basicInfoErrors.productName ? <p className="text-xs text-red-600">{basicInfoErrors.productName}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setIsDirty((prev) => ({ ...prev, 0: true }));
              }}
              maxLength={100}
              onBlur={() => touchField0('brand')}
              className={`w-full px-4 py-2 rounded-lg border ${(touchedStep0.brand || submittedStep0) && basicInfoErrors.brand ? 'border-red-400' : 'border-zinc-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              placeholder="e.g. Ray-Ban"
            />
            {(touchedStep0.brand || submittedStep0) && basicInfoErrors.brand ? <p className="text-xs text-red-600">{basicInfoErrors.brand}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsDirty((prev) => ({ ...prev, 0: true }));
              }}
              maxLength={1000}
              rows={5}
              onBlur={() => touchField0('description')}
              className={`w-full px-4 py-2 rounded-lg border ${(touchedStep0.description || submittedStep0) && basicInfoErrors.description ? 'border-red-400' : 'border-zinc-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              placeholder="Optional description..."
            />
            {(touchedStep0.description || submittedStep0) && basicInfoErrors.description ? <p className="text-xs text-red-600">{basicInfoErrors.description}</p> : null}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            {productId ? (
              <div>
                <span className="font-semibold">Draft created.</span> Product ID: <span className="font-mono text-xs">{productId}</span>
              </div>
            ) : (
              <div>
                <span className="font-semibold">Tip:</span> New products are created as Draft by default.
              </div>
            )}
          </div>
        </div>
      );
    }

    if (step === 1) {
      const images = productDetailQuery.data?.images ?? [];
      return (
        <div className="space-y-8 py-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Product images</h2>
            <p className="mt-1 text-sm text-zinc-600">Upload images and save progress to attach them to the draft.</p>
          </div>

          {!productId ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="text-sm text-amber-900">Please save Basic Info first.</div>
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              const next = files.map((file) => ({
                id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
                file,
                url: URL.createObjectURL(file),
              }));
              setPendingImages((prev) => [...prev, ...next]);
              setIsDirty((prev) => ({ ...prev, 1: true }));
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          />

          <div
            className={
              "rounded-2xl border-2 border-dashed p-8 transition-colors " +
              (isDraggingImages
                ? "border-indigo-400 bg-indigo-50"
                : "border-zinc-200 bg-zinc-50")
            }
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!productId) return;
              setIsDraggingImages(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!productId) return;
              setIsDraggingImages(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingImages(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingImages(false);
              if (!productId) return;

              const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
              if (!files.length) return;

              const next = files.map((file) => ({
                id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
                file,
                url: URL.createObjectURL(file),
              }));
              setPendingImages((prev) => [...prev, ...next]);
              setIsDirty((prev) => ({ ...prev, 1: true }));
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Upload className="h-6 w-6" />
              </div>
              <div className="mt-4 text-base font-bold text-zinc-900">Click to upload or drag and drop</div>
              <div className="mt-1 text-sm text-zinc-600">PNG, JPG, GIF up to 10MB</div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!productId}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  <Upload className="h-4 w-4" />
                  Select images
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pendingImages.forEach((p) => URL.revokeObjectURL(p.url));
                    setPendingImages([]);
                    setIsDirty((prev) => ({ ...prev, 1: true }));
                  }}
                  disabled={!pendingImages.length}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {pendingImages.length ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-zinc-900">Selected images ({pendingImages.length})</div>
                <div className="text-xs text-zinc-500">These are previews. Save progress to upload.</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {pendingImages.map((p) => (
                  <div
                    key={p.id}
                    className="relative group aspect-square rounded-xl overflow-hidden border-2 border-zinc-100 transition-all"
                  >
                    <img src={p.url} alt={p.file.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(p.url);
                          setPendingImages((prev) => prev.filter((x) => x.id !== p.id));
                          setIsDirty((prev) => ({ ...prev, 1: true }));
                        }}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {productId && images.length ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-zinc-900">Uploaded images ({images.length})</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images
                  .slice()
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-zinc-100 transition-all"
                    >
                      <img src={img.imageUrl} alt={img.altText ?? "Product"} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!productId) return;
                            try {
                              await deleteProductImage({ productId, imageId: img.id });
                              toast.success("Image deleted");
                              await queryClient.invalidateQueries({ queryKey: ["manager-product-detail", productId] });
                              setIsDirty((prev) => ({ ...prev, 1: true }));
                            } catch (err) {
                              toast.error(getAxiosMessage(err, "Failed to delete image"));
                            }
                          }}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}

          {uploadImageMutation.isPending ? (
            <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <Spinner className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-700" />
              Uploading...
            </div>
          ) : null}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-8 py-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Product variants</h2>
            <p className="mt-1 text-sm text-zinc-600">Add different versions of your product (e.g. sizes or colors).</p>
          </div>

          {!productId ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="text-sm text-amber-900">Please save Basic Info first.</div>
            </div>
          ) : null}

          {submittedStep2 && variantsErrors.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div className="space-y-1">
                  {variantsErrors.map((e, idx) => (
                    <div key={idx} className="text-sm text-amber-900">
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-zinc-900">New variants</div>
              <div className="mt-1 text-xs text-zinc-500">Create drafts here, then Save Progress to persist to server.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const tempId = Math.random().toString(36).slice(2);
                setNewVariants((prev) => [
                  ...prev,
                  {
                    _tempId: tempId,
                    sku: "",
                    variantName: null,
                    color: null,
                    size: null,
                    material: null,
                    frameWidth: null,
                    lensWidth: null,
                    bridgeWidth: null,
                    templeLength: null,
                    price: 0,
                    compareAtPrice: null,
                    isPreOrder: false,
                    quantityAvailable: 0,
                    pendingImages: [],
                  },
                ]);
                setIsDirty((prev) => ({ ...prev, 2: true }));
              }}
              disabled={!productId}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          </div>

          {newVariants.length ? (
            <div className="space-y-5">
              {newVariants.map((v, idx) => (
                <div key={v._tempId} className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-zinc-900">Variant #{idx + 1}</div>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      onClick={() => {
                        v.pendingImages.forEach((p) => URL.revokeObjectURL(p.url));
                        setNewVariants((prev) => prev.filter((x) => x._tempId !== v._tempId));
                        setIsDirty((prev) => ({ ...prev, 2: true }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-zinc-700">SKU</label>
                      <input
                        type="text"
                        value={v.sku}
                        maxLength={100}
                        onChange={(e) => {
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, sku: e.target.value } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. CBL-TT-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Price</label>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => {
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, price: Number(e.target.value) } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className={
                          "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all " +
                          (v.price != null && v.compareAtPrice != null && v.compareAtPrice < v.price ? "border-red-300" : "border-zinc-200")
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Compare-at</label>
                      <input
                        type="number"
                        value={v.compareAtPrice ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, compareAtPrice: value } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className={
                          "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all " +
                          (v.compareAtPrice != null && v.compareAtPrice < v.price ? "border-red-300" : "border-zinc-200")
                        }
                        placeholder="optional"
                      />
                      {v.compareAtPrice != null && v.compareAtPrice < v.price ? (
                        <p className="text-xs text-red-600">Compare-at must be greater than or equal to price.</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Quantity</label>
                      <input
                        type="number"
                        value={v.quantityAvailable}
                        onChange={(e) => {
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, quantityAvailable: Number(e.target.value) } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 focus:outline-none"
                        disabled
                      />
                      <p className="text-xs text-zinc-500">Inventory quantity is managed via inbound records.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Variant name</label>
                      <input
                        type="text"
                        value={v.variantName ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, variantName: value || null } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        onBlur={() => touchVariantField(v._tempId, 'variantName')}
                        className={
                          "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all " +
                          ((touchedVariants[v._tempId]?.variantName || submittedStep2) && (!v.variantName || !String(v.variantName).trim()) ? "border-red-300" : "border-zinc-200")
                        }
                        placeholder="e.g. Tortoise"
                      />
                      {(touchedVariants[v._tempId]?.variantName || submittedStep2) && (!v.variantName || !String(v.variantName).trim()) ? (
                        <p className="text-xs text-red-600">Variant name is required.</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={v.color ?? "#000000"}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, color: value } : x)));
                            setIsDirty((prev) => ({ ...prev, 2: true }));
                          }}
                          className="h-10 w-12 rounded-lg border border-zinc-200 bg-white p-1"
                          aria-label="Pick color"
                          onBlur={() => touchVariantField(v._tempId, 'color')}
                        />
                        <input
                          type="text"
                          value={v.color ?? ""}
                          readOnly
                          className={
                            "w-full px-4 py-2 rounded-lg border bg-zinc-50 text-zinc-700 focus:outline-none transition-all " +
                            ((touchedVariants[v._tempId]?.color || submittedStep2) && (!v.color || !String(v.color).trim()) ? "border-red-300" : "border-zinc-200")
                          }
                          placeholder="#RRGGBB"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, color: null } : x)));
                            setIsDirty((prev) => ({ ...prev, 2: true }));
                            touchVariantField(v._tempId, 'color');
                          }}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                        >
                          Clear
                        </button>
                      </div>
                      {(touchedVariants[v._tempId]?.color || submittedStep2) && (!v.color || !String(v.color).trim()) ? (
                        <p className="text-xs text-red-600">Color is required.</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Size</label>
                      <select
                        value={v.size ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, size: value || null } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        onBlur={() => touchVariantField(v._tempId, 'size')}
                        className={
                          "w-full px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all " +
                          ((touchedVariants[v._tempId]?.size || submittedStep2) && (!v.size || !String(v.size).trim()) ? "border-red-300" : "border-zinc-200")
                        }
                      >
                        <option value="">Select size</option>
                        <option value="Large">Large</option>
                        <option value="Medium">Medium</option>
                        <option value="Small">Small</option>
                      </select>
                      {(touchedVariants[v._tempId]?.size || submittedStep2) && (!v.size || !String(v.size).trim()) ? (
                        <p className="text-xs text-red-600">Size is required.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Material</label>
                      <input
                        type="text"
                        value={v.material ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, material: value || null } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        onBlur={() => touchVariantField(v._tempId, 'material')}
                        className={
                          "w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all " +
                          ((touchedVariants[v._tempId]?.material || submittedStep2) && (!v.material || !String(v.material).trim()) ? "border-red-300" : "border-zinc-200")
                        }
                        placeholder="e.g. Mixed Acetate"
                      />
                      {(touchedVariants[v._tempId]?.material || submittedStep2) && (!v.material || !String(v.material).trim()) ? (
                        <p className="text-xs text-red-600">Material is required.</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-6 pt-7">
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                        <input
                          type="checkbox"
                          checked={v.isPreOrder}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, isPreOrder: checked } : x)));
                            setIsDirty((prev) => ({ ...prev, 2: true }));
                          }}
                          className="h-4 w-4 rounded border-zinc-300"
                        />
                        Pre-order
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Frame width</label>
                      <input
                        type="number"
                        value={v.frameWidth ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, frameWidth: value } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="mm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Lens width</label>
                      <input
                        type="number"
                        value={v.lensWidth ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, lensWidth: value } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="mm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Bridge width</label>
                      <input
                        type="number"
                        value={v.bridgeWidth ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, bridgeWidth: value } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="mm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Temple length</label>
                      <input
                        type="number"
                        value={v.templeLength ?? ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, templeLength: value } : x)));
                          setIsDirty((prev) => ({ ...prev, 2: true }));
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="mm"
                      />
                    </div>
                  </div>

                  <div className={"mt-6 rounded-2xl border-2 border-dashed p-5 " + (submittedStep2 && v.pendingImages.length === 0 ? "border-red-300 bg-red-50/30" : "border-zinc-200 bg-zinc-50")}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-zinc-900">Variant images</div>
                        <div className="mt-1 text-sm text-zinc-600">Select images, preview them, then Save Progress to upload.</div>
                        {submittedStep2 && v.pendingImages.length === 0 ? (
                          <p className="mt-1 text-xs text-red-600">At least 1 image is required.</p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`variant-file-${v._tempId}`) as HTMLInputElement | null;
                          input?.click();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
                      >
                        <Upload className="h-4 w-4" />
                        Add images
                      </button>
                    </div>

                    <input
                      id={`variant-file-${v._tempId}`}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        const next = files.map((file) => ({
                          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
                          file,
                          url: URL.createObjectURL(file),
                        }));
                        setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, pendingImages: [...x.pendingImages, ...next] } : x)));
                        setIsDirty((prev) => ({ ...prev, 2: true }));
                        (e.target as HTMLInputElement).value = "";
                      }}
                    />

                    {v.pendingImages.length ? (
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {v.pendingImages.map((img) => (
                          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-zinc-100">
                            <img src={img.url} alt={img.file.name} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(img.url);
                                  setNewVariants((prev) => prev.map((x) => (x._tempId === v._tempId ? { ...x, pendingImages: x.pendingImages.filter((p) => p.id !== img.id) } : x)));
                                  setIsDirty((prev) => ({ ...prev, 2: true }));
                                }}
                                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                title="Remove image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-zinc-600">No images selected.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {productId && productDetailQuery.data?.variants?.length ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-sm font-bold text-zinc-900">Existing variants ({productDetailQuery.data.variants.length})</div>
              <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-12 bg-zinc-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <div className="col-span-4">SKU</div>
                    <div className="col-span-2">Color</div>
                    <div className="col-span-1">Size</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-1 text-right">Qty</div>
                    <div className="col-span-1 text-right">Preorder</div>
                    <div className="col-span-1 text-right">Images</div>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {productDetailQuery.data.variants.slice(0, 8).map((v) => (
                      <div key={v.id} className="grid grid-cols-12 px-4 py-3 text-sm">
                        <div className="col-span-4 font-mono text-xs text-zinc-800 break-all">{v.sku}</div>
                        <div className="col-span-2 text-zinc-700">{v.color ?? "-"}</div>
                        <div className="col-span-1 text-zinc-700">{v.size ?? "-"}</div>
                        <div className="col-span-2 text-right font-semibold text-zinc-900">{typeof v.price === "number" ? `$${v.price}` : "-"}</div>
                        <div className="col-span-1 text-right text-zinc-800">{typeof v.quantityAvailable === "number" ? v.quantityAvailable : 0}</div>
                        <div className="col-span-1 text-right">
                          <span className={"inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold " + (v.isPreOrder ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700")}>
                            {v.isPreOrder ? "YES" : "NO"}
                          </span>
                        </div>
                        <div className="col-span-1 text-right text-zinc-800">{v.images?.length ?? 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    // Confirm
    const p = productDetailQuery.data;
    const summaryImages = p?.images?.length ?? 0;
    const summaryVariants = p?.variants?.length ?? 0;
    const thumbnails = p?.images?.slice().sort((a, b) => a.displayOrder - b.displayOrder) ?? [];
    const safePreviewIndex = thumbnails.length ? Math.min(confirmPreviewIndex, thumbnails.length - 1) : 0;
    const mainImageUrl = thumbnails.length ? thumbnails[safePreviewIndex]?.imageUrl ?? null : null;
    const typeLabel = typeOptions.find((x) => x.value === (typeof p?.type === "number" ? p?.type : Number(type)))?.label ?? "";

    return (
      <div className="space-y-8 py-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Confirm</h2>
          <p className="mt-1 text-sm text-zinc-600">Review the details below before finalizing.</p>
        </div>

        {!productId ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="text-sm text-amber-900">Please save Basic Info first.</div>
          </div>
        ) : productDetailQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Spinner />
            Loading product...
          </div>
        ) : null}

        {productId && p ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-emerald-900">Everything looks good! Review the details below before finalizing.</div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-2">
                <div className="text-sm font-bold text-zinc-900">Preview</div>

                <div className="mt-4">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
                    {mainImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setConfirmLightboxOpen(true)}
                        className="h-full w-full cursor-zoom-in"
                        title="Open preview"
                      >
                        <img src={mainImageUrl} alt="Main" className="h-full w-full object-cover" />
                      </button>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">No images uploaded</div>
                    )}
                  </div>

                  {thumbnails.length ? (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {thumbnails.slice(0, 8).map((img, idx) => {
                        const active = idx === safePreviewIndex;
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setConfirmPreviewIndex(idx)}
                            className={
                              "aspect-square overflow-hidden rounded-xl border bg-zinc-50 transition-all " +
                              (active ? "border-indigo-600 shadow-sm" : "border-zinc-100 hover:border-zinc-200")
                            }
                            title={img.altText ?? "Product"}
                          >
                            <img src={img.imageUrl} alt={img.altText ?? "Product"} className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {typeLabel ? (
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-700">{typeLabel}</span>
                      ) : null}
                      {p.category?.name ? (
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-700">{p.category.name}</span>
                      ) : null}
                      {p.brand ? (
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-700">{p.brand}</span>
                      ) : null}
                    </div>

                    <div className="mt-3 text-2xl font-extrabold text-zinc-900">{productName || p.productName}</div>
                    <div className="mt-1 text-sm text-zinc-600">Product ID: <span className="font-mono text-xs">{productId}</span></div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">Draft</span>
                    <div className="text-xs text-zinc-500">Images: <span className="font-semibold text-zinc-700">{summaryImages}</span></div>
                    <div className="text-xs text-zinc-500">Variants: <span className="font-semibold text-zinc-700">{summaryVariants}</span></div>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-100 pt-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</div>
                  <div className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">{(description || p.description || "-").trim() || "-"}</div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-extrabold text-zinc-900">Variants ({summaryVariants})</div>

                  {p.variants?.length ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200">
                      <div className="grid grid-cols-12 bg-zinc-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <div className="col-span-4">SKU</div>
                        <div className="col-span-2">Color</div>
                        <div className="col-span-1">Size</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-1 text-right">Qty</div>
                        <div className="col-span-1 text-right">Preorder</div>
                        <div className="col-span-1 text-right">Images</div>
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {p.variants.slice(0, 10).map((v, idx) => (
                          <div key={v.id} className="grid grid-cols-12 px-4 py-3 text-sm">
                            <div className="col-span-4">
                              <div className="font-mono text-xs text-zinc-800 break-all">{v.sku}</div>
                              <div className="mt-0.5 text-xs text-zinc-500">#{idx + 1}</div>
                            </div>
                            <div className="col-span-2 text-zinc-700">{v.color ?? "-"}</div>
                            <div className="col-span-1 text-zinc-700">{v.size ?? "-"}</div>
                            <div className="col-span-2 text-right font-semibold text-zinc-900">{typeof v.price === "number" ? `$${v.price}` : "-"}</div>
                            <div className="col-span-1 text-right text-zinc-800">{typeof v.quantityAvailable === "number" ? v.quantityAvailable : 0}</div>
                            <div className="col-span-1 text-right">
                              <span className={"inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold " + (v.isPreOrder ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700")}>
                                {v.isPreOrder ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="col-span-1 text-right text-zinc-800">{v.images?.length ?? 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">No variants created yet.</div>
                  )}
                </div>
              </div>
            </div>

            {confirmLightboxOpen && thumbnails.length ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onMouseDown={() => setConfirmLightboxOpen(false)}
              >
                <div
                  className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-zinc-950"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setConfirmLightboxOpen(false)}
                    className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmPreviewIndex((prev) => (prev - 1 + thumbnails.length) % thumbnails.length)}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    title="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmPreviewIndex((prev) => (prev + 1) % thumbnails.length)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    title="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="max-h-[80vh] w-full">
                    <img src={mainImageUrl ?? thumbnails[0].imageUrl} alt="Preview" className="h-full w-full object-contain" />
                  </div>

                  <div className="border-t border-white/10 bg-black/30 px-4 py-3 text-center text-xs font-semibold text-white/80">
                    {safePreviewIndex + 1} / {thumbnails.length}
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  };

  const isSaving = createProductMutation.isPending || uploadImageMutation.isPending || productDetailQuery.isFetching;
  const completedStepsCount = steps.filter((s) => savedSteps[s.id] && !isDirty[s.id]).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Add New Product</h1>
            <p className="mt-1 text-sm text-zinc-600">Fill in details to list a new product. Save progress to resume later.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/manager/products")}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-white hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProgress}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSaving ? <Spinner className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Check className="h-4 w-4" />}
              Save Progress
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
          <div className="px-6 py-6 border-b border-zinc-100 bg-zinc-50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-zinc-700">Progress</div>
              <div className="text-sm text-zinc-600">{completedStepsCount}/{steps.length} completed</div>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-zinc-200 rounded-full" />
                <div
                  className="absolute top-5 left-0 h-1 bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                />
                <div className="grid grid-cols-4 gap-2">
                  {stepMeta.map((s) => {
                    const isCompleted = savedSteps[s.id] && !isDirty[s.id];
                    const isActive = step === s.id;
                    return (
                      <div key={s.id} className="flex flex-col items-center">
                        <div
                          className={
                            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all " +
                            (isCompleted
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                              : isActive
                                ? "bg-white border-indigo-600 text-indigo-600 shadow"
                                : "bg-white border-zinc-200 text-zinc-400")
                          }
                        >
                          {isCompleted ? <Check className="h-5 w-5" /> : s.icon}
                        </div>
                        <div className={"mt-3 text-[11px] font-bold uppercase tracking-wider " + (isActive ? "text-zinc-900" : "text-zinc-500")}>
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-6 py-6 border-t border-zinc-100 bg-zinc-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canNext}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPublishDialogOpen(true)}
                  disabled={!productId}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Complete Listing
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={resumeDialogOpen}
        title="Resume draft?"
        description="We found an unfinished product creation progress. Do you want to resume it?"
        onClose={() => setResumeDialogOpen(false)}
      >
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50"
            onClick={() => {
              clearPersistedState();
              setResumeDialogOpen(false);
              setPendingResumeState(null);
            }}
          >
            Discard
          </button>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
            onClick={() => {
              const s = pendingResumeState;
              if (!s?.productId) {
                setResumeDialogOpen(false);
                return;
              }

              setProductId(s.productId);
              setStep(s.step ?? 0);
              setSavedSteps(s.savedSteps ?? { 0: true, 1: false, 2: false, 3: false });
              setResumeDialogOpen(false);
            }}
          >
            Resume
          </button>
        </div>
      </Modal>

      <Modal
        open={publishDialogOpen}
        title="Complete product"
        description="Choose whether to publish now or keep as draft."
        onClose={() => setPublishDialogOpen(false)}
      >
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            onClick={() => setPublishDialogOpen(false)}
            disabled={isPublishing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            onClick={() => handleComplete("draft")}
            disabled={isPublishing}
          >
            Keep Draft
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            onClick={() => handleComplete("publish")}
            disabled={isPublishing}
          >
            {isPublishing ? <Spinner className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
            Publish
          </button>
        </div>
      </Modal>

      {createProductMutation.isError ? (
        <div className="mx-auto max-w-5xl px-4 pb-8">
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {getAxiosMessage(createProductMutation.error, "Failed to create product")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
