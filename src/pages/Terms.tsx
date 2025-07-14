import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-forest mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-forest">Welcome to EcoLakbay</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                By using EcoLakbay, you agree to these Terms of Service. Please read them carefully as they govern your use of our sustainable tourism platform and services.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  By accessing or using EcoLakbay, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">2. Use of Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Permitted Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Calculate and track your carbon footprint</li>
                    <li>Discover sustainable tourism destinations</li>
                    <li>Participate in community discussions</li>
                    <li>Register eco-friendly businesses</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Posting false or misleading information</li>
                    <li>Harassment or inappropriate behavior</li>
                    <li>Attempting to compromise platform security</li>
                    <li>Commercial use without permission</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">3. User Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You are responsible for maintaining account security</li>
                  <li>Provide accurate and current information</li>
                  <li>Notify us of any unauthorized access</li>
                  <li>One account per person or business entity</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">4. Content Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Content posted on EcoLakbay must be related to sustainable tourism and environmental responsibility. We reserve the right to remove content that violates our community guidelines.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Content Standards</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Must be relevant to sustainable tourism</li>
                    <li>No spam, advertisements, or promotional content</li>
                    <li>Respect intellectual property rights</li>
                    <li>Maintain respectful and constructive tone</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">5. Business Partners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Businesses registering as eco-destinations must comply with additional requirements:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide accurate business information</li>
                  <li>Maintain genuine sustainability practices</li>
                  <li>Respond to customer inquiries promptly</li>
                  <li>Allow verification of eco-friendly claims</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">6. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  EcoLakbay provides information and tools to support sustainable tourism decisions. While we strive for accuracy, we cannot guarantee the completeness or reliability of all information. Users are responsible for verifying information before making travel decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">7. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We may update these Terms of Service periodically. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-forest">8. Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> legal@ecolakbay.com</p>
                  <p><strong>Address:</strong> EcoLakbay Legal Department, San Fernando, Pampanga, Philippines</p>
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

export default Terms;