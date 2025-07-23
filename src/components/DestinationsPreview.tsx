import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Import featured destination images
import bataanBeach from "@/assets/bataan-beach.jpg";
import tarlacTerraces from "@/assets/tarlac-terraces.jpg";
import rizalMangroves from "@/assets/rizal-mangroves.jpg";
import batangasCoral from "@/assets/batangas-coral.jpg";
import quezonResort from "@/assets/quezon-resort.jpg";
import bulacanFarm from "@/assets/bulacan-farm.jpg";

const DestinationsPreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLearnMore = (destinationName: string) => {
    navigate("/destinations");
  };

  const handleViewAllDestinations = () => {
    navigate("/destinations");
  };
  const destinations = [
    {
      id: 1,
      name: "Subic Bay Eco-Beach Resort",
      location: "Subic Bay, Bataan",
      rating: 4.9,
      ecoScore: 96,
      image: bataanBeach,
      tags: ["Beach Conservation", "Marine Sanctuary", "Eco-Resort"],
      description: "Pristine beach with mangrove restoration and sustainable tourism practices."
    },
    {
      id: 2,
      name: "Tarlac Heritage Rice Terraces",
      location: "Camiling, Tarlac",
      rating: 4.7,
      ecoScore: 93,
      image: tarlacTerraces,
      tags: ["Sustainable Agriculture", "Cultural Heritage", "Rice Farming"],
      description: "Ancient rice terraces showcasing traditional sustainable farming methods."
    },
    {
      id: 3,
      name: "Rizal Mangrove Conservation Park",
      location: "Tanay, Rizal",
      rating: 4.8,
      ecoScore: 95,
      image: rizalMangroves,
      tags: ["Mangrove Conservation", "Boardwalk Tours", "Marine Education"],
      description: "Floating boardwalks through mangrove forests supporting coastal protection."
    },
    {
      id: 4,
      name: "Batangas Coral Restoration Center",
      location: "Mabini, Batangas",
      rating: 4.9,
      ecoScore: 97,
      image: batangasCoral,
      tags: ["Marine Conservation", "Coral Restoration", "Diving Education"],
      description: "Marine research center actively restoring coral reefs through community programs."
    },
    {
      id: 5,
      name: "Quezon Solar-Powered Eco-Resort",
      location: "Lucena, Quezon",
      rating: 4.5,
      ecoScore: 92,
      image: quezonResort,
      tags: ["Solar Energy", "Eco-Resort", "Sustainable Tourism"],
      description: "Luxury eco-resort powered entirely by renewable solar energy."
    },
    {
      id: 6,
      name: "Bulacan Organic Farm Sanctuary",
      location: "San Miguel, Bulacan",
      rating: 4.5,
      ecoScore: 91,
      image: bulacanFarm,
      tags: ["Organic Farming", "Solar Energy", "Farm-to-Table"],
      description: "Solar-powered organic farm demonstrating sustainable agriculture practices."
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
                <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                  {typeof destination.image === 'string' && destination.image.includes('.jpg') ? (
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-card">
                      {destination.image}
                    </div>
                  )}
                </div>
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