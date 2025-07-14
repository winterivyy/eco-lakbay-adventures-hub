import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-forest mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-forest">Our Commitment to Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                At EcoLakbay, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our sustainable tourism platform.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Account credentials for authentication</li>
                    <li>Profile information and preferences</li>
                    <li>Business information for partner destinations</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Carbon footprint calculations and travel data</li>
                    <li>Community posts and interactions</li>
                    <li>Platform usage patterns and preferences</li>
                    <li>Device information and IP addresses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and improve our sustainable tourism services</li>
                  <li>Calculate and track your environmental impact</li>
                  <li>Facilitate community interactions and networking</li>
                  <li>Send relevant updates about eco-friendly travel opportunities</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations and regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">Data Protection & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We implement industry-standard security measures to protect your personal information, including encryption, secure data transmission, and regular security audits.
                </p>
                <p>
                  Your data is stored securely and accessed only by authorized personnel who need it to provide our services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access and review your personal information</li>
                  <li>Update or correct inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  If you have questions about this Privacy Policy or how we handle your data, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> privacy@ecolakbay.com</p>
                  <p><strong>Address:</strong> EcoLakbay Privacy Office, San Fernando, Pampanga, Philippines</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;