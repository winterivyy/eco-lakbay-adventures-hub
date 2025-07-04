import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DestinationsPreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLearnMore = (destinationName: string) => {
    toast({
      title: `${destinationName}`,
      description: "Detailed destination information coming soon!",
    });
  };

  const handleViewAllDestinations = () => {
    navigate("/destinations");
  };
  const destinations = [
    {
      id: 1,
      name: "Mount Arayat National Park",
      location: "Arayat, Pampanga",
      rating: 4.8,
      ecoScore: 95,
      image: "🏔️",
      tags: ["Hiking", "Wildlife", "Eco-Lodge"],
      description: "Experience pristine nature with sustainable hiking trails and eco-friendly accommodations."
    },
    {
      id: 2,
      name: "Candaba Wetlands",
      location: "Candaba, Pampanga",
      rating: 4.6,
      ecoScore: 92,
      image: "🦅",
      tags: ["Birdwatching", "Wetlands", "Conservation"],
      description: "A haven for migratory birds with community-led conservation programs."
    },
    {
      id: 3,
      name: "Clark Green City",
      location: "Angeles, Pampanga",
      rating: 4.7,
      ecoScore: 88,
      image: "🌆",
      tags: ["Urban Ecology", "Green Architecture", "Solar Power"],
      description: "Modern sustainable city showcasing green urban planning and renewable energy."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-4">
            Featured Eco-Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover Pampanga's most sustainable and breathtaking destinations, 
            verified by our eco-certification program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="text-6xl text-center mb-4">{destination.image}</div>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-forest group-hover:text-forest-light transition-colors">
                    {destination.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-gradient-accent text-white border-0">
                      {destination.ecoScore}% Eco
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{destination.location}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {destination.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-amber text-sm">⭐</span>
                    <span className="font-medium text-sm">{destination.rating}</span>
                  </div>
                  <Button variant="outline" size="sm" className="hover:bg-forest hover:text-white" onClick={() => handleLearnMore(destination.name)}>
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="eco" size="lg" onClick={handleViewAllDestinations}>
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DestinationsPreview;