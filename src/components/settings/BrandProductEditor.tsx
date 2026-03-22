import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Package, Pencil, Trash2, Image, DollarSign, Hash, Star, Tag, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from "papaparse";

export interface ProductData {
  name: string;
  category?: string;
  price?: number;
  stock?: number;
  sku?: string;
  description?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  variants?: string[];
  tags?: string[];
  url?: string;
}

interface BrandProductEditorProps {
  products: ProductData[];
  onChange: (products: ProductData[]) => void;
  saving?: boolean;
}

const emptyProduct: ProductData = {
  name: "",
  category: "",
  price: undefined,
  stock: undefined,
  sku: "",
  description: "",
  image: "",
  rating: undefined,
  reviewCount: undefined,
  variants: [],
  tags: [],
  url: "",
};

export function BrandProductEditor({ products, onChange, saving }: BrandProductEditorProps) {
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [variantInput, setVariantInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingProduct({ ...emptyProduct });
    setEditingIndex(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (product: ProductData, index: number) => {
    setEditingProduct({ ...product });
    setEditingIndex(index);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!editingProduct?.name.trim()) return;

    const updatedProducts = [...products];
    if (editingIndex !== null) {
      updatedProducts[editingIndex] = editingProduct;
    } else {
      updatedProducts.push(editingProduct);
    }
    onChange(updatedProducts);
    setShowDialog(false);
    setEditingProduct(null);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    onChange(products.filter((_, i) => i !== index));
  };

  const handleFieldChange = (field: keyof ProductData, value: any) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  const handleAddVariant = () => {
    if (!variantInput.trim() || !editingProduct) return;
    const variants = [...(editingProduct.variants || []), variantInput.trim()];
    setEditingProduct({ ...editingProduct, variants });
    setVariantInput("");
  };

  const handleRemoveVariant = (index: number) => {
    if (!editingProduct) return;
    const variants = (editingProduct.variants || []).filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, variants });
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editingProduct) return;
    const tags = [...(editingProduct.tags || []), tagInput.trim()];
    setEditingProduct({ ...editingProduct, tags });
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    if (!editingProduct) return;
    const tags = (editingProduct.tags || []).filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, tags });
  };

  // Shared upload function
  const uploadImage = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      handleFieldChange("image", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }, []);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  }, [uploadImage]);

  // CSV import handler
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingCsv(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const importedProducts: ProductData[] = results.data.map((row: any) => ({
            name: row.name || row.Name || row.title || row.Title || "",
            category: row.category || row.Category || "",
            price: row.price || row.Price ? parseFloat(row.price || row.Price) : undefined,
            stock: row.stock || row.Stock || row.quantity || row.Quantity ? parseInt(row.stock || row.Stock || row.quantity || row.Quantity) : undefined,
            sku: row.sku || row.SKU || "",
            description: row.description || row.Description || "",
            image: row.image || row.Image || row.image_url || row.imageUrl || "",
            rating: row.rating || row.Rating ? parseFloat(row.rating || row.Rating) : undefined,
            reviewCount: row.reviewCount || row.reviews || row.Reviews ? parseInt(row.reviewCount || row.reviews || row.Reviews) : undefined,
            variants: row.variants ? row.variants.split(",").map((v: string) => v.trim()) : [],
            tags: row.tags || row.Tags ? (row.tags || row.Tags).split(",").map((t: string) => t.trim()) : [],
            url: row.url || row.URL || row.link || row.Link || "",
          })).filter((p: ProductData) => p.name.trim() !== "");

          if (importedProducts.length === 0) {
            toast.error("No valid products found in CSV");
            return;
          }

          onChange([...products, ...importedProducts]);
          toast.success(`Imported ${importedProducts.length} products`);
        } catch (error) {
          console.error("CSV parse error:", error);
          toast.error("Failed to parse CSV file");
        } finally {
          setImportingCsv(false);
          if (csvInputRef.current) {
            csvInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        console.error("CSV error:", error);
        toast.error("Failed to read CSV file");
        setImportingCsv(false);
      }
    });
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {products.length} product{products.length !== 1 ? "s" : ""} configured
        </p>
        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleCsvImport}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => csvInputRef.current?.click()}
            disabled={importingCsv}
          >
            {importingCsv ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* CSV Format Help */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <strong>CSV Format:</strong> name, category, price, stock, sku, description, image, rating, reviewCount, variants (comma-separated), tags (comma-separated), url
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No products added yet</p>
              <p className="text-xs mt-1">Add products manually or import from CSV</p>
            </div>
          ) : (
            products.map((product, index) => (
              <Card key={index} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="h-16 w-16 rounded-lg border border-border bg-muted flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium truncate">{product.name}</h4>
                          {product.category && (
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(product, index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {product.price !== undefined && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <DollarSign className="h-3 w-3" />
                            {product.price.toFixed(2)}
                          </span>
                        )}
                        {product.stock !== undefined && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            {product.stock} in stock
                          </span>
                        )}
                        {product.rating !== undefined && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            {product.rating.toFixed(1)}
                          </span>
                        )}
                        {product.sku && (
                          <span className="text-xs text-muted-foreground font-mono">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>

                      {(product.tags?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags?.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {(product.tags?.length ?? 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(product.tags?.length ?? 0) - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit/Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              Fill in the product details. Only name is required.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editingProduct?.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingProduct?.category || ""}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    placeholder="e.g., Electronics, Clothing"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct?.price ?? ""}
                    onChange={(e) => handleFieldChange("price", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editingProduct?.stock ?? ""}
                    onChange={(e) => handleFieldChange("stock", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={editingProduct?.sku || ""}
                    onChange={(e) => handleFieldChange("sku", e.target.value)}
                    placeholder="ABC-123"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingProduct?.rating ?? ""}
                    onChange={(e) => handleFieldChange("rating", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="4.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewCount">Review Count</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    min="0"
                    value={editingProduct?.reviewCount ?? ""}
                    onChange={(e) => handleFieldChange("reviewCount", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image Upload with Drag & Drop */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={editingProduct?.image || ""}
                    onChange={(e) => handleFieldChange("image", e.target.value)}
                    placeholder="Image URL or drag & drop below"
                    className="flex-1"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => imageInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isDragging 
                      ? "border-primary bg-primary/10 scale-[1.02]" 
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }
                    ${uploadingImage ? "pointer-events-none opacity-50" : ""}
                  `}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : editingProduct?.image ? (
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg border border-border overflow-hidden flex-shrink-0">
                        <img 
                          src={editingProduct.image} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Image uploaded</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {editingProduct.image}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFieldChange("image", "");
                          }}
                          className="text-xs text-destructive hover:underline mt-1"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-3 rounded-full transition-colors ${isDragging ? "bg-primary/20" : "bg-muted"}`}>
                        <Image className={`h-6 w-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isDragging ? "Drop image here" : "Drag & drop an image"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Max file size: 5MB. Supported: JPG, PNG, GIF, WebP</p>
              </div>

              {/* Product URL */}
              <div className="space-y-2">
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  value={editingProduct?.url || ""}
                  onChange={(e) => handleFieldChange("url", e.target.value)}
                  placeholder="https://example.com/product"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct?.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <Label>Variants</Label>
                <div className="flex gap-2">
                  <Input
                    value={variantInput}
                    onChange={(e) => setVariantInput(e.target.value)}
                    placeholder="Add variant (e.g., Red, Large)"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariant())}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddVariant}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(editingProduct?.variants?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct?.variants?.map((variant, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {variant}
                        <button onClick={() => handleRemoveVariant(i)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {(editingProduct?.tags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct?.tags?.map((tag, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(i)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!editingProduct?.name.trim() || saving}>
              {editingIndex !== null ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
