import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadFieldProps {
  id: string;
  label?: string;
  value?: string | null;
  onChange: (file: File) => void;
  accept?: string;
  description?: string;
  placeholder?: string;
  uploading?: boolean;
  previewSize?: "sm" | "md" | "lg";
  previewClassName?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function FileUploadField({
  id,
  label,
  value,
  onChange,
  accept = "image/*",
  description,
  placeholder = "No file",
  uploading = false,
  previewSize = "md",
  previewClassName,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-6">
      <div 
        className={`${sizeClasses[previewSize]} rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden ${previewClassName || ""}`}
      >
        {value ? (
          <img 
            src={value} 
            alt={label || "Preview"} 
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-muted-foreground text-sm text-center px-2">{placeholder}</span>
        )}
      </div>
      <div className="flex-1">
        <Label htmlFor={id} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              disabled={uploading} 
              onClick={handleClick}
              type="button"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {label || "Upload File"}
                </>
              )}
            </Button>
          </div>
        </Label>
        <Input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        {description && (
          <p className="text-sm text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
