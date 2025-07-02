import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FeaturesSection = () => {
  const features = [
    {
      icon: "🗺️",
      title: "Smart Recommendations",
      description: "Discover verified sustainable destinations and eco-certified establishments tailored to your preferences.",
      color: "bg-gradient-hero"
    },
    {
      icon: "🌍",
      title: "Carbon Tracking",
      description: "Monitor and reduce your travel's environmental impact with our built-in carbon footprint calculator.",
      color: "bg-forest"
    },
    {
      icon: "💰",
      title: "Green Rewards",
      description: "Earn Green Points for sustainable choices and redeem them for exclusive eco-friendly experiences.",
      color: "bg-gradient-accent"
    },
    {
      icon: "🤖",
      title: "AI Travel Assistant",
      description: "Get personalized eco-friendly itineraries and local recommendations from our smart chatbot.",
      color: "bg-nature"
    },
    {
      icon: "🏢",
      title: "Business Hub",
      description: "Local tourism businesses can register and showcase their sustainable practices to conscious travelers.",
      color: "bg-earth"
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Community Feed",
      description: "Share experiences, join eco-events, and connect with like-minded travelers and locals.",
      color: "bg-forest-light"
    }
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-4">
            Sustainable Tourism Made Simple
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            EcoLakbay combines cutting-edge technology with environmental responsibility 
            to create meaningful travel experiences that benefit both travelers and local communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 border-0 shadow-eco">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <CardTitle className="text-xl text-forest">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="eco" size="lg" className="px-8 py-6 text-lg">
            Start Your Eco Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;