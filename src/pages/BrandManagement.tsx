import { useState } from "react";
import { PageContainer, SettingsPageHeader, SettingsSection } from "@/components/shared";
import { useBrand, Brand } from "@/contexts/BrandContext";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Globe, Palette, Building2, Loader2, Check } from "lucide-react";

export default function BrandManagement() {
  const { brands, activeBrand, loading, switchBrand, refetchBrands } = useBrand();
  const { organization } = useOrganization();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    primary_color: "#6366f1",
    secondary_color: "#8b5cf6",
    accent_color: "#ec4899"
  });

  const resetForm = () => {
    setFormData({
      name: "",
      website_url: "",
      primary_color: "#6366f1",
      secondary_color: "#8b5cf6",
      accent_color: "#ec4899"
    });
  };

  const handleAddBrand = async () => {
    if (!organization || !formData.name || !formData.website_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("brands")
        .insert({
          org_id: organization.id,
          name: formData.name,
          website_url: formData.website_url,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color
        });

      if (error) throw error;

      toast.success("Brand created successfully");
      setIsAddDialogOpen(false);
      resetForm();
      refetchBrands();
    } catch (error: any) {
      console.error("Error creating brand:", error);
      toast.error(error.message || "Failed to create brand");
    } finally {
      setSaving(false);
    }
  };

  const handleEditBrand = async () => {
    if (!selectedBrand || !formData.name || !formData.website_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("brands")
        .update({
          name: formData.name,
          website_url: formData.website_url,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color
        })
        .eq("id", selectedBrand.id);

      if (error) throw error;

      toast.success("Brand updated successfully");
      setIsEditDialogOpen(false);
      setSelectedBrand(null);
      resetForm();
      refetchBrands();
    } catch (error: any) {
      console.error("Error updating brand:", error);
      toast.error(error.message || "Failed to update brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("brands")
        .update({ is_active: false })
        .eq("id", selectedBrand.id);

      if (error) throw error;

      toast.success("Brand deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedBrand(null);
      refetchBrands();
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      toast.error(error.message || "Failed to delete brand");
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      website_url: brand.website_url,
      primary_color: brand.primary_color || "#6366f1",
      secondary_color: brand.secondary_color || "#8b5cf6",
      accent_color: brand.accent_color || "#ec4899"
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  return (
    <PageContainer className="max-w-4xl">
      <SettingsPageHeader
        title="Brand Management"
        description="Manage your organization's brands"
      />

      <SettingsSection icon={Building2} title="Your Brands" animationDelay="100ms">
        <div className="flex justify-end mb-4">
          <Button variant="gradient" onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No brands yet. Create your first brand to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className={`p-4 transition-all duration-200 ${
                  activeBrand?.id === brand.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-12 h-12 rounded-lg object-contain bg-background"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                      >
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{brand.name}</h3>
                        {activeBrand?.id === brand.id && (
                          <Badge variant="soft" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" />
                        <span>{brand.website_url}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex gap-1">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                            title="Primary"
                          />
                          <div
                            className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: brand.secondary_color || "#8b5cf6" }}
                            title="Secondary"
                          />
                          <div
                            className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: brand.accent_color || "#ec4899" }}
                            title="Accent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeBrand?.id !== brand.id && (
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => switchBrand(brand.id)}
                      >
                        Switch
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(brand)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(brand)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Add Brand Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Create a new brand for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Brand"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL *</Label>
              <Input
                id="website"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent"
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleAddBrand} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update brand details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Brand Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website URL *</Label>
              <Input
                id="edit-website"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleEditBrand} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBrand?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
