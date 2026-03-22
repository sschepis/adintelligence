import { useState, useRef } from "react";
import { PageContainer, SettingsSection, SettingsPageHeader } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProfileStats } from "@/hooks/useProfileStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Camera, Loader2, User, Mail, Calendar, Save,
  Target, Bookmark, FlaskConical, ImageIcon, FileText, BarChart3
} from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { stats, loading: statsLoading } = useProfileStats();
  
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize display name from profile
  useState(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  });

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    await updateProfile({ display_name: displayName.trim() || null });
    setIsUpdating(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setIsUploading(true);
    await uploadAvatar(file);
    setIsUploading(false);
  };

  const currentDisplayName = displayName || profile?.display_name || user?.email?.split("@")[0] || "";
  const initials = currentDisplayName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer className="max-w-2xl">
          <SettingsPageHeader
            title="Profile Settings"
            description="Manage your account information"
          />

          {/* Avatar Section */}
          <SettingsSection icon={ImageIcon} title="Profile Picture">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-secondary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-medium">{currentDisplayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Button 
                  variant="glass" 
                  size="sm" 
                  className="mt-3 gap-2"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Profile Details */}
          <SettingsSection icon={FileText} title="Profile Details" animationDelay="100ms">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName || profile?.display_name || ""}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="max-w-md bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Member Since
                </Label>
                <Input
                  value={user?.created_at ? format(new Date(user.created_at), "MMMM d, yyyy") : ""}
                  disabled
                  className="max-w-md bg-secondary/50"
                />
              </div>

              <div className="pt-4">
                <Button
                  variant="gradient"
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Account Stats */}
          <SettingsSection icon={BarChart3} title="Account Overview" animationDelay="200ms" className="mb-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.campaigns}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Campaigns</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bookmark className="h-4 w-4 text-accent" />
                </div>
                <p className="text-2xl font-bold text-accent">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.savedTrends}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Saved Trends</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FlaskConical className="h-4 w-4 text-signal-rising" />
                </div>
                <p className="text-2xl font-bold text-signal-rising">
                  {statsLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : stats.simulations}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Simulations</p>
              </div>
            </div>
          </SettingsSection>
    </PageContainer>
  );
}
