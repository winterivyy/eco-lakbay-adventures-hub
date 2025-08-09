import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermitFile {
  id: string;
  file: File;
  permitType: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
}

// --- CHANGE #1: MODIFIED PROPS ---
// The component now requires a `destinationId` to link the permits.
interface PermitUploadProps {
  userId: string;
  destinationId: string;
  onPermitsUploaded?: (permits: any[]) => void;
}

const permitTypes = [
  { value: 'business_permit', label: 'Business Permit', required: true },
  { value: 'tourism_permit', label: 'Tourism Permit', required: true },
  { value: 'environmental_clearance', label: 'Environmental Clearance', required: false },
  { value: 'fire_safety', label: 'Fire Safety Certificate', required: true },
  { value: 'health_permit', label: 'Health Permit (for F&B)', required: false },
  { value: 'other', label: 'Other Permits', required: false }
];

export const PermitUpload: React.FC<PermitUploadProps> = ({ userId, destinationId, onPermitsUploaded }) => {
  const [permits, setPermits] = useState<PermitFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (!validTypes.includes(file.type)) {
        toast({ title: "Invalid file type", description: `${file.name} is not a supported type.`, variant: "destructive" });
        return false;
      }
      if (file.size > maxSize) {
        toast({ title: "File too large", description: `${file.name} exceeds the 10MB size limit.`, variant: "destructive" });
        return false;
      }
      return true;
    });
    const newPermits: PermitFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      permitType: '',
      status: 'pending' as const
    }));
    setPermits(prev => [...prev, ...newPermits]);
  };

  const updatePermitType = (permitId: string, type: string) => {
    setPermits(prev => prev.map(permit => permit.id === permitId ? { ...permit, permitType: type } : permit));
  };

  const removePermit = (permitId: string) => {
    setPermits(prev => prev.filter(permit => permit.id !== permitId));
  };

  const uploadPermits = async () => {
    if (!destinationId) {
      toast({ title: "Error", description: "Cannot upload permits without a destination ID.", variant: "destructive" });
      return;
    }
    const permitsToUpload = permits.filter(p => p.permitType && (p.status === 'pending' || p.status === 'error'));
    if (permitsToUpload.length === 0) {
      toast({ title: "No new permits to upload", description: "Please add documents and select their types.", variant: "destructive" });
      return;
    }

    const requiredTypes = permitTypes.filter(type => type.required).map(type => type.value);
    const allStagedTypes = permits.map(p => p.permitType);
    const missingRequired = requiredTypes.filter(type => !allStagedTypes.includes(type));
    if (missingRequired.length > 0) {
      const missingLabels = permitTypes.filter(type => missingRequired.includes(type.value)).map(type => type.label).join(', ');
      toast({ title: "Missing required permits", description: `Please upload: ${missingLabels}`, variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const successfulUploads: any[] = [];
    const failedUploads: PermitFile[] = [];

    for (const permit of permitsToUpload) {
      try {
        setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'uploading' as const } : p));

        const fileExt = permit.file.name.split('.').pop();
        const fileName = `${userId}/${destinationId}/${permit.permitType}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('permits').upload(fileName, permit.file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('permits').getPublicUrl(fileName);

        // --- CHANGE #2: THE CRUCIAL UPDATE IS HERE ---
        // We now include the `destination_id` in the database record.
        const { data: permitData, error: permitError } = await supabase
          .from('destination_permits')
          .insert({
            user_id: userId,
            destination_id: destinationId, // This line was added
            permit_type: permit.permitType,
            file_url: publicUrl,
            file_name: permit.file.name,
            verification_status: 'pending'
          })
          .select()
          .single();

        if (permitError) throw permitError;

        setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'success' as const, url: publicUrl } : p));
        successfulUploads.push(permitData);

      } catch (error) {
        console.error('Failed to upload permit:', permit.file.name, error);
        failedUploads.push(permit);
        setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'error' as const } : p));
      }
    }

    setIsUploading(false);
    if (successfulUploads.length > 0) toast({ title: "Uploads Complete", description: `${successfulUploads.length} document(s) uploaded successfully.` });
    if (failedUploads.length > 0) toast({ title: "Some uploads failed", description: `${failedUploads.length} document(s) failed. Please try again.`, variant: "destructive" });
    if (onPermitsUploaded && successfulUploads.length > 0) onPermitsUploaded(successfulUploads);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  const allUploadedPermitTypes = permits.filter(p => p.status === 'success').map(p => p.permitType);
  const pendingOrFailedPermits = permits.filter(p => p.status === 'pending' || p.status === 'error');
  const allRequiredPermitsAreStaged = permitTypes.filter(p => p.required).every(req => [...allUploadedPermitTypes, ...pendingOrFailedPermits.map(p => p.permitType)].includes(req.value));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Permit Verification Documents</CardTitle>
        <Alert>
          <AlertCircle className="h-4 w-4" /><AlertDescription>Upload the required permits for your establishment. Supported formats: PDF, JPG, PNG (max 10MB each).</AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Required Documents Checklist:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permitTypes.filter(t => t.required).map(type => {
              const isUploaded = allUploadedPermitTypes.includes(type.value);
              return (
                <div key={type.value} className="flex items-center gap-2">
                  {isUploaded ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                  <span className={`text-sm ${isUploaded ? 'text-green-700 font-medium' : 'text-muted-foreground'}`}>{type.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">Upload Permit Documents</h4>
          <p className="text-muted-foreground mb-4">Drag and drop files here, or click to browse</p>
          <Input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInput} className="hidden" id="permit-upload" />
          <Label htmlFor="permit-upload"><Button variant="outline" asChild><span>Choose Files</span></Button></Label>
        </div>
        {permits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Documents to be Uploaded:</h4>
            {permits.map(permit => (
              <div key={permit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">{getFileIcon(permit.file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{permit.file.name}</p>
                  <p className="text-sm text-muted-foreground">{(permit.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={permit.permitType} onValueChange={(value) => updatePermitType(permit.id, value)} disabled={permit.status === 'success' || permit.status === 'uploading'}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Select permit type..." /></SelectTrigger>
                    <SelectContent>{permitTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label} {type.required && '*'}</SelectItem>))}</SelectContent>
                  </Select>
                  {permit.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                  {permit.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {permit.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive" title="Upload Failed" />}
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => removePermit(permit.id)} disabled={permit.status === 'success'} aria-label="Remove file"><X className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {permits.length > 0 && (
          <Button
            onClick={uploadPermits}
            disabled={isUploading || pendingOrFailedPermits.length === 0 || !allRequiredPermitsAreStaged}
            className="w-full">
            {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>) : `Submit ${pendingOrFailedPermits.length > 0 ? pendingOrFailedPermits.length : ''} Document(s)`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
