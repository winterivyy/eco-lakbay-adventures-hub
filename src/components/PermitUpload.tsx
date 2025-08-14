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

interface PermitUploadProps {
  userId: string;
  destinationId: string;
  onPermitsUploaded: () => void; // Simplified to just be a signal
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

  const handleDrag = useCallback((e: React.DragEvent) => { /* ... Unchanged ... */ }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files)); }, []);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(Array.from(e.target.files)); };
  
  const handleFiles = (fileList: File[]) => { /* ... Unchanged ... */ };
  const updatePermitType = (permitId: string, type: string) => { setPermits(prev => prev.map(p => p.id === permitId ? { ...p, permitType: type } : p)); };
  const removePermit = (permitId: string) => { setPermits(prev => prev.filter(p => p.id !== permitId)); };

  const uploadPermits = async () => {
    if (!destinationId) {
      toast({ title: "Error", description: "Cannot upload permits without a destination ID.", variant: "destructive" });
      return;
    }
    const permitsToUpload = permits.filter(p => p.permitType && (p.status === 'pending' || p.status === 'error'));
    if (permitsToUpload.length === 0) {
      toast({ title: "No new permits to upload", variant: "destructive" });
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
        const { data: permitData, error: permitError } = await supabase
          .from('destination_permits')
          .insert({ user_id: userId, destination_id: destinationId, permit_type: permit.permitType, file_url: publicUrl, file_name: permit.file.name, verification_status: 'pending' })
          .select().single();
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

    if (successfulUploads.length > 0) toast({ title: "Uploads Processed", description: `${successfulUploads.length} document(s) uploaded successfully.` });
    if (failedUploads.length > 0) toast({ title: "Some Uploads Failed", description: `${failedUploads.length} document(s) failed. Please review them and try again.`, variant: "destructive" });
    
    // --- THE KEY LOGICAL FIX ---
    // Only call the success callback if there were NO failures and at least one success.
    if (failedUploads.length === 0 && successfulUploads.length > 0) {
      onPermitsUploaded();
    }
  };

  const getFileIcon = (fileType: string) => { /* ... Unchanged ... */ return '📄'; };
  const allUploadedPermitTypes = permits.filter(p => p.status === 'success').map(p => p.permitType);
  const pendingOrFailedPermits = permits.filter(p => p.status === 'pending' || p.status === 'error');
  const allRequiredPermitsAreStaged = permitTypes.filter(p => p.required).every(req => [...allUploadedPermitTypes, ...pendingOrFailedPermits.map(p => p.permitType)].includes(req.value));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Permit Verification Documents</CardTitle>
        <Alert>
          <AlertCircle className="h-4 w-4" /><AlertDescription>Upload the required permits for your establishment. All required permits must be uploaded to complete your registration.</AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Required Documents Checklist:</h4>
          {/* ... Unchanged Checklist JSX ... */}
        </div>
        <div className={`border-2 ...`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          {/* ... Unchanged Dropzone JSX ... */}
        </div>
        {permits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Documents to be Uploaded:</h4>
            {permits.map(permit => (
              <div key={permit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {/* ... Unchanged File List JSX ... */}
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
