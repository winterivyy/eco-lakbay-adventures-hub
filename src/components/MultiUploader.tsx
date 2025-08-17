import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MultiUploaderProps {
  bucketName: string;
  folderPath: string;
  fileTypes: string[];
  maxSizeMB: number;
  onUploadComplete: (publicUrls: string[]) => void;
  title: string;
  description: string;
}

export const MultiUploader: React.FC<MultiUploaderProps> = ({ bucketName, folderPath, fileTypes, maxSizeMB, onUploadComplete, title, description }) => {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) handleFiles(Array.from(files));
  };
  
  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
        if (!fileTypes.includes(file.type)) { toast({ title: "Invalid file type", variant: "destructive" }); return false; }
        if (file.size > maxSizeMB * 1024 * 1024) { toast({ title: "File too large", description: `Max size is ${maxSizeMB}MB`, variant: "destructive" }); return false; }
        return true;
    });
    setStagedFiles(prev => [...prev, ...validFiles]);
  };
  
  const handleRemoveStagedFile = (indexToRemove: number) => {
    setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (stagedFiles.length === 0) return;
    setIsUploading(true);
    const uploadPromises = stagedFiles.map(async file => {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const fullPath = `${folderPath}/${fileName}`;
      const { error } = await supabase.storage.from(bucketName).upload(fullPath, file);
      if (error) throw error;
      const { data } = supabase.storage.from(bucketName).getPublicUrl(fullPath);
      return data.publicUrl;
    });

    try {
      const newUrls = await Promise.all(uploadPromises);
      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      setStagedFiles([]);
      onUploadComplete(allUrls);
      toast({ title: "Upload successful!", description: `${newUrls.length} file(s) uploaded.` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
        <h3 className="text-lg font-semibold text-forest mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {/* --- STAGED FILE PREVIEWS --- */}
        {stagedFiles.length > 0 && <div className="space-y-2 mb-4">
            {stagedFiles.map((file, index) => ( <div key={index} className="flex items-center justify-between p-2 border rounded-lg text-sm"><p className="truncate">{file.name}</p><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveStagedFile(index)}><Trash2 className="w-4 h-4" /></Button></div> ))}
        </div>}
        
        <Label htmlFor={`multi-upload-${bucketName}`} className="cursor-pointer border-2 border-dashed rounded-lg p-6 text-center block hover:bg-muted">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm">Click to browse or drag & drop files</p>
        </Label>
        <Input id={`multi-upload-${bucketName}`} type="file" multiple onChange={handleFileSelect} className="hidden" />

        {stagedFiles.length > 0 && (
            <Button onClick={handleUpload} disabled={isUploading} className="mt-4 w-full">
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Uploading...</> : `Upload ${stagedFiles.length} file(s)`}
            </Button>
        )}
        
        {uploadedUrls.length > 0 && <div className="mt-4 flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5"/> <p>{uploadedUrls.length} file(s) have been successfully uploaded and linked.</p></div>}
    </div>
  );
};
