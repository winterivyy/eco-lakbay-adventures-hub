import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermitFile {
  id: string;
  file: File;
  permitType: string;
  status: 'uploading' | 'success' | 'error';
  url?: string;
}

interface PermitUploadProps {
  userId: string;
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

export const PermitUpload: React.FC<PermitUploadProps> = ({ userId, onPermitsUploaded }) => {
  const [permits, setPermits] = useState<PermitFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, JPG, or PNG files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum file size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    const newPermits: PermitFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      permitType: '',
      status: 'uploading' as const
    }));

    setPermits(prev => [...prev, ...newPermits]);
  };

  const updatePermitType = (permitId: string, type: string) => {
    setPermits(prev => prev.map(permit => 
      permit.id === permitId ? { ...permit, permitType: type } : permit
    ));
  };

  const removePermit = (permitId: string) => {
    setPermits(prev => prev.filter(permit => permit.id !== permitId));
  };

  const uploadPermits = async () => {
    const permitsToUpload = permits.filter(permit => permit.permitType && permit.status !== 'success');
    
    if (permitsToUpload.length === 0) {
      toast({
        title: "No permits to upload",
        description: "Please add permits and select their types.",
        variant: "destructive",
      });
      return;
    }

    // Check for required permits
    const requiredTypes = permitTypes.filter(type => type.required).map(type => type.value);
    const uploadedTypes = permitsToUpload.map(permit => permit.permitType);
    const missingRequired = requiredTypes.filter(type => !uploadedTypes.includes(type));
    
    if (missingRequired.length > 0) {
      const missingLabels = permitTypes
        .filter(type => missingRequired.includes(type.value))
        .map(type => type.label)
        .join(', ');
      
      toast({
        title: "Missing required permits",
        description: `Please upload the following required permits: ${missingLabels}`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadedPermits = [];

      for (const permit of permitsToUpload) {
        const fileExt = permit.file.name.split('.').pop();
        const fileName = `${userId}/${permit.permitType}_${Date.now()}.${fileExt}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('permits')
          .upload(fileName, permit.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('permits')
          .getPublicUrl(fileName);

        // Save permit record to database
        const { data: permitData, error: permitError } = await supabase
          .from('destination_permits')
          .insert({
            user_id: userId,
            permit_type: permit.permitType,
            file_url: publicUrl,
            file_name: permit.file.name,
            verification_status: 'pending'
          })
          .select()
          .single();

        if (permitError) throw permitError;

        uploadedPermits.push(permitData);

        // Update permit status
        setPermits(prev => prev.map(p => 
          p.id === permit.id ? { ...p, status: 'success' as const, url: publicUrl } : p
        ));
      }

      toast({
        title: "Permits uploaded successfully",
        description: `${uploadedPermits.length} permit(s) uploaded and submitted for verification.`,
      });

      onPermitsUploaded?.(uploadedPermits);

    } catch (error) {
      console.error('Error uploading permits:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your permits. Please try again.",
        variant: "destructive",
      });

      // Update failed permits
      setPermits(prev => prev.map(permit => 
        permitsToUpload.some(p => p.id === permit.id) 
          ? { ...permit, status: 'error' as const }
          : permit
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  const requiredPermits = permitTypes.filter(type => type.required);
  const uploadedRequiredTypes = permits
    .filter(p => p.status === 'success')
    .map(p => p.permitType);
  const missingRequired = requiredPermits.filter(type => 
    !uploadedRequiredTypes.includes(type.value)
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Permit Verification Documents
        </CardTitle>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload the required permits and licenses for your establishment. All documents must be valid and current.
            Supported formats: PDF, JPG, PNG (max 10MB each).
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Permits Checklist */}
        <div>
          <h4 className="font-medium mb-3">Required Documents:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {requiredPermits.map(type => {
              const isUploaded = uploadedRequiredTypes.includes(type.value);
              return (
                <div key={type.value} className="flex items-center gap-2">
                  {isUploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className={`text-sm ${isUploaded ? 'text-green-700' : 'text-muted-foreground'}`}>
                    {type.label}
                  </span>
                  {isUploaded && (
                    <Badge variant="secondary" className="text-xs">
                      Uploaded
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">Upload Permit Documents</h4>
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <Input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="hidden"
            id="permit-upload"
          />
          <Label htmlFor="permit-upload">
            <Button variant="outline" asChild>
              <span>Choose Files</span>
            </Button>
          </Label>
        </div>

        {/* Uploaded Files List */}
        {permits.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Documents:</h4>
            {permits.map(permit => (
              <div key={permit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-2xl">{getFileIcon(permit.file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{permit.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(permit.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={permit.permitType}
                    onValueChange={(value) => updatePermitType(permit.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select permit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {permitTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} {type.required && '*'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {permit.status === 'success' && (
                    <Badge variant="secondary" className="text-green-700">
                      Uploaded
                    </Badge>
                  )}
                  
                  {permit.status === 'error' && (
                    <Badge variant="destructive">
                      Failed
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePermit(permit.id)}
                    disabled={permit.status === 'success'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {permits.length > 0 && (
          <div className="flex flex-col gap-4">
            {missingRequired.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Missing required permits: {missingRequired.map(type => type.label).join(', ')}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={uploadPermits}
              disabled={isUploading || permits.every(p => p.status === 'success') || missingRequired.length > 0}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Submit Documents for Verification'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};