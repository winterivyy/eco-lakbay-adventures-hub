import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PermitUpload } from "@/components/PermitUpload";
import { PhotoUpload } from "@/components/PhotoUpload";
import { MapPin, Phone, Mail, Globe, Building, Camera, Star, FileCheck, Image as ImageIcon } from "lucide-react";

const DestinationRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("business");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: "", businessType: "", description: "", address: "", city: "", province: "",
    phone: "", email: "", website: "", sustainabilityPractices: "",
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [permitIds, setPermitIds] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleCreateOrUpdateDestination = async () => {
    if (!user) {
      toast({ title: "Authentication Required", variant: "destructive" });
      return false;
    }
    if (!formData.businessName || !formData.businessType || !formData.address) {
      toast({ title: "Missing Business Info", description: "Please fill all required fields in the Business Info tab.", variant: "destructive" });
      setCurrentTab("business");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        owner_id: user.id, business_name: formData.businessName, business_type: formData.businessType,
        description: formData.description, address: formData.address, city: formData.city,
        province: formData.province, phone: formData.phone || null, email: formData.email,
        website: formData.website || null, sustainability_practices: formData.sustainabilityPractices || null,
        images: photoUrls.length > 0 ? photoUrls : null
      };

      let finalDestinationId = destinationId;
      if (destinationId) {
        const { error } = await supabase.from('destinations').update(payload).eq('id', destinationId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('destinations').insert(payload).select('id').single();
        if (error) throw error;
        finalDestinationId = data.id;
        setDestinationId(data.id);
      }
      
      if (permitIds.length > 0 && finalDestinationId) {
        await supabase.from('destination_permits').update({ destination_id: finalDestinationId }).in('id', permitIds);
        setPermitIds([]);
      }
      return true;
    } catch (error) {
      console.error("Error saving destination details:", error);
      toast({ title: "Error Saving Details", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleProceed = async (nextTab: string) => {
    const success = await handleCreateOrUpdateDestination();
    if (success) {
      if (!destinationId) {
        toast({ title: "Step 1 Complete!", description: "Business Info Saved. You can now add photos and permits." });
      } else {
        toast({ title: "Progress Saved!" });
      }
      setCurrentTab(nextTab);
    }
  };
  
  const handlePhotosChange = (urls: string[]) => setPhotoUrls(urls);
  const handlePermitsUploaded = (uploadedPermits: any[]) => {
      const newPermitIds = uploadedPermits.map(p => p.id);
      setPermitIds(prev => [...new Set([...prev, ...newPermitIds])]);
  };

  const handleFinalSubmit = async () => {
    const success = await handleCreateOrUpdateDestination();
    if(success) {
        toast({
            title: "Registration Submitted!",
            description: "Thank you! We'll review your application and documents within 5-7 business days.",
        });
        navigate("/my-destinations");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-forest mb-4">Join EcoLakbay as a Partner Destination</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Register your eco-friendly establishment, attraction, or service to become part of the sustainable tourism movement in the Philippines.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center"><CardHeader><Star className="w-8 h-8 text-accent mx-auto mb-2" /><CardTitle className="text-lg">Increased Visibility</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Reach eco-conscious travelers actively seeking sustainable destinations.</p></CardContent></Card>
            <Card className="text-center"><CardHeader><Building className="w-8 h-8 text-accent mx-auto mb-2" /><CardTitle className="text-lg">Community Support</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Join a network of like-minded businesses committed to sustainable tourism.</p></CardContent></Card>
            <Card className="text-center"><CardHeader><Camera className="w-8 h-8 text-accent mx-auto mb-2" /><CardTitle className="text-lg">Marketing Tools</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Access professional listing features and promotional opportunities.</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-2xl text-forest">Registration Application</CardTitle><CardDescription>Follow the steps to complete your registration. Your progress is saved at each step.</CardDescription></CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="business"><Building className="w-4 h-4 mr-2" />Business Info</TabsTrigger>
                  <TabsTrigger value="photos" disabled={!destinationId}><ImageIcon className="w-4 h-4 mr-2" />Photos</TabsTrigger>
                  <TabsTrigger value="verification" disabled={!destinationId}><FileCheck className="w-4 h-4 mr-2" />Verification</TabsTrigger>
                  <TabsTrigger value="review" disabled={!destinationId}><Star className="w-4 h-4 mr-2" />Submit</TabsTrigger>
                </TabsList>
                
                {/* --- BUSINESS INFO TAB --- */}
                <TabsContent value="business" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-forest">Business Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="businessName">Business Name *</Label><Input id="businessName" placeholder="Enter your business name" value={formData.businessName} onChange={(e) => handleInputChange("businessName", e.target.value)} required /></div>
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                          <SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hotel">Hotel/Resort</SelectItem>
                            <SelectItem value="restaurant">Restaurant/Café</SelectItem>
                            <SelectItem value="attraction">Tourist Attraction</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select> {/* --- The single, correct closing tag --- */}
                      </div>
                    </div>
                    <div className="space-y-2"><Label htmlFor="description">Business Description *</Label><Textarea id="description" placeholder="Describe your business and what makes it special..." className="min-h-[120px]" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required /></div>
                  </div>
                  <div className="space-y-4"><h3 className="text-lg font-semibold text-forest flex items-center gap-2"><MapPin className="w-5 h-5" />Location Information</h3><div className="space-y-2"><Label htmlFor="address">Street Address *</Label><Input id="address" placeholder="Enter complete street address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required /></div><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="city">City/Municipality *</Label><Input id="city" placeholder="City or municipality" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="province">Province *</Label><Input id="province" placeholder="Province" value={formData.province} onChange={(e) => handleInputChange("province", e.target.value)} required /></div></div></div>
                  <div className="space-y-4"><h3 className="text-lg font-semibold text-forest">Contact Information</h3><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" />Phone Number</Label><Input id="phone" type="tel" placeholder="+63 900 000 0000" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" />Email Address *</Label><Input id="email" type="email" placeholder="business@example.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required /></div></div><div className="space-y-2"><Label htmlFor="website" className="flex items-center gap-2"><Globe className="w-4 h-4" />Website (Optional)</Label><Input id="website" type="url" placeholder="https://yourwebsite.com" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} /></div></div>
                  <div className="space-y-4"><h3 className="text-lg font-semibold text-forest">Sustainability Practices</h3><div className="space-y-2"><Label htmlFor="sustainabilityPractices">Tell us about your environmental initiatives</Label><Textarea id="sustainabilityPractices" placeholder="Describe your eco-friendly practices..." className="min-h-[120px]" value={formData.sustainabilityPractices} onChange={(e) => handleInputChange("sustainabilityPractices", e.target.value)} /></div></div>
                  <div className="flex justify-end pt-6"><Button onClick={() => handleProceed('photos')} disabled={isSubmitting} variant="eco">{isSubmitting ? 'Saving...' : 'Save & Proceed to Photos'}</Button></div>
                </TabsContent>
                
                <TabsContent value="photos" className="space-y-6"><CardTitle>Destination Photos</CardTitle><CardDescription>Upload at least one high-quality photo. The first image will be your main cover photo.</CardDescription><PhotoUpload onPhotosChange={handlePhotosChange} bucketName="destination-photos"/><div className="flex justify-between pt-6"><Button variant="outline" onClick={() => setCurrentTab("business")}>Back to Business Info</Button><Button variant="eco" onClick={() => handleProceed('verification')} disabled={isSubmitting || photoUrls.length === 0}>{isSubmitting ? 'Saving...' : 'Save & Proceed to Verification'}</Button></div></TabsContent>
                <TabsContent value="verification" className="space-y-6">{user && destinationId && (<PermitUpload userId={user.id} destinationId={destinationId} onPermitsUploaded={handlePermitsUploaded} />)}<div className="flex justify-between pt-6"><Button variant="outline" onClick={() => setCurrentTab("photos")}>Back to Photos</Button><Button variant="eco" onClick={() => handleProceed('review')} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save & Proceed to Review'}</Button></div></TabsContent>
                <TabsContent value="review" className="space-y-6"><h3 className="text-lg font-semibold">Application Summary</h3><Card><CardHeader><CardTitle className="text-base">Review Your Information</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">All required information has been provided. Click the button below to submit your application for review by our team.</p></CardContent></Card><div className="flex justify-between pt-6"><Button variant="outline" onClick={() => setCurrentTab("verification")}>Back</Button><Button variant="eco" size="lg" onClick={handleFinalSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Full Application'}</Button></div></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="mt-12 text-center"><Card className="bg-muted/50"><CardContent className="pt-6"><h3 className="text-lg font-semibold text-forest mb-2">What Happens Next?</h3><p className="text-muted-foreground">After submitting your registration, our team will review your application within 5-7 business days. We may contact you for additional information about your sustainability practices.</p></CardContent></Card></div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationRegistration;
