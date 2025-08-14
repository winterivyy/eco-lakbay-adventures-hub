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

// --- FIX #1: THE PROPS INTERFACE IS NOW CORRECT ---
interface PermitUploadProps {
  userId: string;
  destinationId: string; // The component now expects this ID
  onPermitsUploaded: () => void; // This is a simple signal for success
}

const permitTypes = [
  { value: 'business_permit', label: 'Business Permit', required: true },
  { value: 'tourism_permit', label: 'Tourism Permit', required: true },
  { value: 'environmental_clearance', label: 'Environmental Clearance', required: false },
  { value: 'fire_safety', label: 'Fire Safety Certificate', required: true },
  { value: 'other', label: 'Other Permits', required: false }
];

export const PermitUpload: React.FC<PermitUploadProps> = ({ userId, destinationId, onPermitsUploaded }) => {
  const [permits, setPermits] = useState<PermitFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        toast({ title: "Invalid file type", variant: "destructive" });
        return false;
      }
      if (file.size > maxSize) {
        toast({ title: "File too large", variant: "destructive" });
        return false;
      }
      return true;
    });
    const newPermits: PermitFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file, permitType: '', status: 'pending'
    }));
    setPermits(prev => [...prev, ...newPermits]);
  };

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

    const requiredTypes = permitTypes.filter(t => t.required).map(t => t.value);
    const uploadedPermitTypes = permits.map(p => p.permitType);
    const missingRequired = requiredTypes.filter(type => !uploadedPermitTypes.includes(type));
    if (missingRequired.length > 0) {
      toast({ title: "Missing required permits", description: `Please upload all required documents to continue.`, variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let allSucceeded = true;

    for (const permit of permitsToUpload) {
      try {
        setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'uploading' } : p));
        const fileExt = permit.file.name.split('.').pop();
        const fileName = `${userId}/${destinationId}/${permit.permitType}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('permits').upload(fileName, permit.file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('permits').getPublicUrl(fileName);
        
        // --- FIX #2: THE DATABASE INSERT IS NOW CORRECT ---
        const { error: permitError } = await supabase.from('destination_permits').insert({
          user_id: userId,
          destination_id: destinationId, // The ID from the props is used here
          permit_type: permit.permitType,
          file_url: publicUrl,
          file_name: permit.file.name,
          verification_status: 'pending'
        });
        if (permitError) throw permitError;

        setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'success', url: publicUrl } : p));
      } catch (error) {
        console.error('Failed to upload permit:', permit.file.name, error);
        allSucceeded = false;
        setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'error' } : p));
      }
    }

    setIsUploading(false);

    // --- FIX #3: THE SUCCESS LOGIC IS NOW ROBUST ---
    if (allSucceeded) {
      toast({ title: "All Permits Uploaded Successfully!" });
      onPermitsUploaded(); // Signal to the parent that we are done
    } else {
      toast({ title: "Some Uploads Failed", description: "Please review the documents marked with an error and try submitting again.", variant: "destructive" });
    }
  };

  const getFileIcon = (fileType: string) => { /* Unchanged */ return '📄'; };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Permit Verification Documents</CardTitle>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Upload all required permits. Once all are uploaded, you can submit them to complete your registration.</AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Required Documents Checklist:</h4>
          {/* ... Checklist JSX (Unchanged) ... */}
        </div>
        <div className={`border-2 ...`} onDragEnter={handleDrag} onDrop={handleDrop} onDragLeave={handleDrag} onDragOver={handleDrag}>
          {/* ... Dropzone JSX (Unchanged) ... */}
        </div>
        {permits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Documents to be Uploaded:</h4>
            {permits.map(permit => (
              <div key={permit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {/* ... File List Item JSX (Unchanged) ... */}
              </div>
            ))}
          </div>
        )}
        {permits.length > 0 && (
          <Button onClick={uploadPermits} disabled={isUploading} className="w-full">
            {isUploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>) : `Submit All Documents`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
