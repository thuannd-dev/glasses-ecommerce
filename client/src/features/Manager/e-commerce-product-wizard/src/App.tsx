import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Image as ImageIcon,
  Package,
  Layers,
  Eye,
  Send,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductData, ProductVariant, WizardStep } from './types';

export default function App() {
  const [step, setStep] = useState<WizardStep>(1);
  const [product, setProduct] = useState<ProductData>({
    name: '',
    category: '',
    brand: '',
    description: '',
    basePrice: 0,
    sku: '',
    images: [],
    mainImageIndex: 0,
    publishStatus: 'draft',
    variants: []
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5) as WizardStep);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as WizardStep);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: name === 'basePrice' ? parseFloat(value) || 0 : value }));
  };

  // --- Step 1: Basic Information ---
  const Step1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Product Name</label>
          <input 
            type="text" 
            name="name"
            value={product.name}
            onChange={handleBasicInfoChange}
            placeholder="e.g. Wireless Noise Cancelling Headphones"
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Category</label>
          <select 
            name="category"
            value={product.category}
            onChange={handleBasicInfoChange}
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
          >
            <option value="">Select Category</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Living</option>
            <option value="beauty">Beauty</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Brand</label>
          <input 
            type="text" 
            name="brand"
            value={product.brand}
            onChange={handleBasicInfoChange}
            placeholder="e.g. Sony"
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">SKU</label>
          <input 
            type="text" 
            name="sku"
            value={product.sku}
            onChange={handleBasicInfoChange}
            placeholder="e.g. WH-1000XM4"
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-zinc-700">Base Price ($)</label>
          <input 
            type="number" 
            name="basePrice"
            value={product.basePrice || ''}
            onChange={handleBasicInfoChange}
            placeholder="0.00"
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-zinc-700">Description</label>
          <textarea 
            name="description"
            value={product.description}
            onChange={handleBasicInfoChange}
            rows={4}
            placeholder="Describe your product in detail..."
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );

  // --- Step 2: Product Images ---
  const Step2 = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const newImages = Array.from(files as FileList).map((file: File) => URL.createObjectURL(file));
        setProduct(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      }
    };

    const removeImage = (index: number) => {
      setProduct(prev => {
        const newImages = prev.images.filter((_, i) => i !== index);
        let newMainIndex = prev.mainImageIndex;
        if (index === prev.mainImageIndex) newMainIndex = 0;
        else if (index < prev.mainImageIndex) newMainIndex = prev.mainImageIndex - 1;
        return { ...prev, images: newImages, mainImageIndex: newMainIndex };
      });
    };

    const setMainImage = (index: number) => {
      setProduct(prev => ({ ...prev, mainImageIndex: index }));
    };

    return (
      <div className="space-y-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Click to upload or drag and drop</h3>
            <p className="text-sm text-zinc-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {product.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${product.mainImageIndex === idx ? 'border-indigo-600 shadow-lg' : 'border-zinc-100'}`}>
                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setMainImage(idx)}
                    className="p-2 bg-white rounded-full text-indigo-600 hover:bg-indigo-50"
                    title="Set as main image"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeImage(idx)}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {product.mainImageIndex === idx && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- Step 3: Publish Option ---
  const Step3 = () => (
    <div className="space-y-8 py-4">
      <div className="text-center max-w-md mx-auto">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to go live?</h3>
        <p className="text-zinc-500">Choose whether you want to publish this product immediately or save it as a draft for later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button 
          onClick={() => setProduct(prev => ({ ...prev, publishStatus: 'publish' }))}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${product.publishStatus === 'publish' ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-200 hover:border-zinc-300'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${product.publishStatus === 'publish' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
            <Send className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-zinc-900">Publish Now</h4>
          <p className="text-sm text-zinc-500 mt-1">Product will be visible to customers immediately after saving.</p>
        </button>

        <button 
          onClick={() => setProduct(prev => ({ ...prev, publishStatus: 'draft' }))}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${product.publishStatus === 'draft' ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-200 hover:border-zinc-300'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${product.publishStatus === 'draft' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-zinc-900">Save as Draft</h4>
          <p className="text-sm text-zinc-500 mt-1">Keep it hidden. You can review and publish it later from your dashboard.</p>
        </button>
      </div>
    </div>
  );

  // --- Step 4: Product Variants ---
  const Step4 = () => {
    const addVariant = () => {
      const newVariant: ProductVariant = {
        id: Math.random().toString(36).substr(2, 9),
        color: '',
        size: '',
        price: product.basePrice,
        stock: 0,
        sku: `${product.sku}-${product.variants.length + 1}`
      };
      setProduct(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
    };

    const removeVariant = (id: string) => {
      setProduct(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== id) }));
    };

    const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
      setProduct(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Product Variants</h3>
            <p className="text-sm text-zinc-500">Add different versions of your product (e.g. sizes or colors)</p>
          </div>
          <button 
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        {product.variants.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
            <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No variants added yet. Click the button above to add one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {product.variants.map((v, idx) => (
              <div key={v.id} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Variant #{idx + 1}</span>
                  <button 
                    onClick={() => removeVariant(v.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Color</label>
                    <input 
                      type="text" 
                      value={v.color}
                      onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                      placeholder="e.g. Midnight Blue"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Size</label>
                    <input 
                      type="text" 
                      value={v.size}
                      onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                      placeholder="e.g. XL"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Price ($)</label>
                    <input 
                      type="number" 
                      value={v.price}
                      onChange={(e) => updateVariant(v.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Stock</label>
                    <input 
                      type="number" 
                      value={v.stock}
                      onChange={(e) => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">SKU</label>
                    <input 
                      type="text" 
                      value={v.sku}
                      onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- Step 5: Confirm Product ---
  const Step5 = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
        <Check className="w-5 h-5" />
        <p className="text-sm font-medium">Everything looks good! Review the details below before finalizing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images */}
        <div className="lg:col-span-1 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
            {product.images.length > 0 ? (
              <img 
                src={product.images[product.mainImageIndex]} 
                alt="Main product" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                <span className="text-xs">No images uploaded</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <div key={idx} className={`aspect-square rounded-lg overflow-hidden border ${product.mainImageIndex === idx ? 'border-indigo-600' : 'border-zinc-200'}`}>
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase rounded">{product.category || 'Uncategorized'}</span>
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase rounded">{product.brand || 'No Brand'}</span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900">{product.name || 'Unnamed Product'}</h2>
              <p className="text-sm text-zinc-500 mt-1">SKU: {product.sku || 'N/A'}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">${product.basePrice.toFixed(2)}</div>
              <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.publishStatus === 'publish' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-800'}`}>
                {product.publishStatus === 'publish' ? 'Published' : 'Draft'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Description</h4>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
          </div>

          {product.variants.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Variants ({product.variants.length})</h4>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Color / Size</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {product.variants.map((v) => (
                      <tr key={v.id}>
                        <td className="px-4 py-3 font-medium text-zinc-900">{v.color || '-'} / {v.size || '-'}</td>
                        <td className="px-4 py-3 text-zinc-500">{v.sku}</td>
                        <td className="px-4 py-3 text-zinc-500">{v.stock}</td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900">${v.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const steps = [
    { id: 1, name: 'Basic Info', icon: Package },
    { id: 2, name: 'Images', icon: ImageIcon },
    { id: 3, name: 'Publishing', icon: Send },
    { id: 4, name: 'Variants', icon: Layers },
    { id: 5, name: 'Confirm', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Add New Product</h1>
            <p className="text-zinc-500 mt-1">Fill in the details to list a new product in your store.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Cancel</button>
            <button className="px-6 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm">Save Progress</button>
          </div>
        </div>

        {/* Wizard Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          {/* Progress Indicator */}
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-6">
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-200 z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-500 z-0"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((s) => {
                const Icon = s.icon;
                const isCompleted = step > s.id;
                const isActive = step === s.id;

                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted ? 'bg-indigo-600 text-white' : 
                        isActive ? 'bg-white border-2 border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-100' : 
                        'bg-white border-2 border-zinc-200 text-zinc-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`}>
                      {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8 md:p-12 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && <Step1 />}
                {step === 2 && <Step2 />}
                {step === 3 && <Step3 />}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {step < 5 ? (
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => alert('Product Finalized!')}
                  className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                >
                  Complete Listing
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tips / Help */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-zinc-900">Pro Tip</h5>
              <p className="text-xs text-zinc-500 mt-1">High-quality images increase conversion rates by up to 40%.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-zinc-900">Image SEO</h5>
              <p className="text-xs text-zinc-500 mt-1">Use descriptive filenames for your images to help with search rankings.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-zinc-900">Inventory</h5>
              <p className="text-xs text-zinc-500 mt-1">Set up low stock alerts in your settings to never miss a sale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
