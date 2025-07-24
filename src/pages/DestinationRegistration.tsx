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
import { MapPin, Phone, Mail, Globe, Building, Camera, Star, FileCheck } from "lucide-react";

const DestinationRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("business");
  const [permits, setPermits] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    description: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    email: "",
    website: "",
    sustainabilityPractices: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register your destination.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.businessName || !formData.businessType || !formData.description || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if required permits are uploaded
    const requiredPermitTypes = ['business_permit', 'tourism_permit', 'fire_safety'];
    const uploadedPermitTypes = permits.map(permit => permit.permit_type);
    const missingPermits = requiredPermitTypes.filter(type => !uploadedPermitTypes.includes(type));
    
    if (missingPermits.length > 0) {
      toast({
        title: "Missing Required Permits",
        description: "Please upload all required permits in the Verification tab before submitting.",
        variant: "destructive",
      });
      setCurrentTab("verification");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: destinationData, error: destinationError } = await supabase
        .from('destinations')
        .insert({
          owner_id: user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          phone: formData.phone || null,
          email: formData.email,
          website: formData.website || null,
          sustainability_practices: formData.sustainabilityPractices || null,
        })
        .select()
        .single();

      if (destinationError) throw destinationError;

      // Update permits with destination_id
      if (permits.length > 0) {
        const { error: permitUpdateError } = await supabase
          .from('destination_permits')
          .update({ destination_id: destinationData.id })
          .in('id', permits.map(permit => permit.id));

        if (permitUpdateError) {
          console.error('Error updating permits:', permitUpdateError);
          // Don't fail the whole process, just log the error
        }
      }

      toast({
        title: "Registration Submitted!",
        description: "Thank you for your interest in joining EcoLakbay. We'll review your application and permits within 5-7 business days.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Error submitting destination:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermitsUploaded = (uploadedPermits: any[]) => {
    setPermits(prev => [...prev, ...uploadedPermits]);
  };

  const canProceedToSubmit = () => {
    const requiredFields = [
      formData.businessName,
      formData.businessType,
      formData.description,
      formData.address,
      formData.city,
      formData.province,
      formData.email
    ];
    
    const requiredPermitTypes = ['business_permit', 'tourism_permit', 'fire_safety'];
    const uploadedPermitTypes = permits.map(permit => permit.permit_type);
    const hasRequiredPermits = requiredPermitTypes.every(type => uploadedPermitTypes.includes(type));
    
    return requiredFields.every(field => field.trim()) && hasRequiredPermits;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-forest mb-4">
              Join EcoLakbay as a Partner Destination
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Register your eco-friendly establishment, attraction, or service to become part of the sustainable tourism movement in the Philippines.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Star className="w-8 h-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-lg">Increased Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reach eco-conscious travelers actively seeking sustainable destinations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Building className="w-8 h-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-lg">Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join a network of like-minded businesses committed to sustainable tourism.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Camera className="w-8 h-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-lg">Marketing Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access professional listing features and promotional opportunities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-forest">Registration Application</CardTitle>
              <CardDescription>
                Complete your destination registration by providing business information and uploading verification documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Business Info
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Verification
                  </TabsTrigger>
                  <TabsTrigger value="review" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Review & Submit
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="business" className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-forest">Business Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select onValueChange={(value) => handleInputChange("businessType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel/Resort</SelectItem>
                          <SelectItem value="restaurant">Restaurant/Café</SelectItem>
                          <SelectItem value="attraction">Tourist Attraction</SelectItem>
                          <SelectItem value="transport">Transportation Service</SelectItem>
                          <SelectItem value="tour">Tour Operator</SelectItem>
                          <SelectItem value="retail">Retail/Souvenir Shop</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business, services, and what makes you special..."
                      className="min-h-[120px]"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-forest flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Enter complete street address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Municipality *</Label>
                      <Input
                        id="city"
                        placeholder="City or municipality"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        placeholder="Province"
                        value={formData.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-forest">Contact Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+63 900 000 0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website (Optional)
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                  </div>
                </div>

                {/* Sustainability Practices */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-forest">Sustainability Practices</h3>
                  <div className="space-y-2">
                    <Label htmlFor="sustainabilityPractices">
                      Tell us about your environmental initiatives and sustainable practices
                    </Label>
                    <Textarea
                      id="sustainabilityPractices"
                      placeholder="Describe your eco-friendly practices, certifications, community involvement, waste reduction efforts, etc."
                      className="min-h-[120px]"
                      value={formData.sustainabilityPractices}
                      onChange={(e) => handleInputChange("sustainabilityPractices", e.target.value)}
                    />
                  </div>
                </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("verification")}
                      variant="eco"
                    >
                      Next: Upload Permits
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-6">
                  {user && (
                    <PermitUpload 
                      userId={user.id}
                      onPermitsUploaded={handlePermitsUploaded}
                    />
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("business")}
                    >
                      Back: Business Info
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentTab("review")}
                      variant="eco"
                      disabled={permits.length === 0}
                    >
                      Next: Review & Submit
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="review" className="space-y-6">
                  {/* Review Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-forest mb-4">Application Summary</h3>
                      
                      {/* Business Information Summary */}
                      <Card className="mb-4">
                        <CardHeader>
                          <CardTitle className="text-base">Business Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div><strong>Name:</strong> {formData.businessName || "Not provided"}</div>
                          <div><strong>Type:</strong> {formData.businessType || "Not selected"}</div>
                          <div><strong>Location:</strong> {formData.address}, {formData.city}, {formData.province}</div>
                          <div><strong>Email:</strong> {formData.email || "Not provided"}</div>
                          {formData.phone && <div><strong>Phone:</strong> {formData.phone}</div>}
                          {formData.website && <div><strong>Website:</strong> {formData.website}</div>}
                        </CardContent>
                      </Card>

                      {/* Permits Summary */}
                      <Card className="mb-4">
                        <CardHeader>
                          <CardTitle className="text-base">Uploaded Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {permits.length > 0 ? (
                            <div className="space-y-2">
                              {permits.map((permit, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span className="font-medium">{permit.permit_type.replace('_', ' ').toUpperCase()}</span>
                                  <span className="text-sm text-green-600">✓ Uploaded</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No permits uploaded yet.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Submit Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab("verification")}
                        className="flex-1"
                      >
                        Back: Verification
                      </Button>
                      <Button
                        type="submit"
                        variant="eco"
                        size="lg"
                        disabled={isSubmitting || !canProceedToSubmit()}
                        className="flex-1"
                      >
                        {isSubmitting ? "Submitting Application..." : "Submit Registration"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="mt-12 text-center">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-forest mb-2">What Happens Next?</h3>
                <p className="text-muted-foreground">
                  After submitting your registration, our team will review your application within 5-7 business days. 
                  We may contact you for additional information or to schedule a brief interview about your sustainability practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DestinationRegistration;