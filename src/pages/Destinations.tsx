import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const Destinations = () => {
  const handleDestinationClick = (destination: any) => {
    console.log('Visiting destination:', destination.name);
    // You can add navigation logic here, e.g.:
    // navigate(`/destinations/${destination.id}`);
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
      description: "Experience pristine nature with sustainable hiking trails and eco-friendly accommodations.",
      carbonSaved: "2.5 kg CO²"
    },
    {
      id: 2,
      name: "Candaba Wetlands",
      location: "Candaba, Pampanga",
      rating: 4.6,
      ecoScore: 92,
      image: "🦅",
      tags: ["Birdwatching", "Wetlands", "Conservation"],
      description: "A haven for migratory birds with community-led conservation programs.",
      carbonSaved: "1.8 kg CO²"
    },
    {
      id: 3,
      name: "Clark Green City",
      location: "Angeles, Pampanga",
      rating: 4.7,
      ecoScore: 88,
      image: "🌆",
      tags: ["Urban Ecology", "Green Architecture", "Solar Power"],
      description: "Modern sustainable city showcasing green urban planning and renewable energy.",
      carbonSaved: "3.2 kg CO²"
    },
    {
      id: 4,
      name: "San Fernando Heritage District",
      location: "San Fernando, Pampanga",
      rating: 4.5,
      ecoScore: 85,
      image: "🏛️",
      tags: ["Cultural Heritage", "Walking Tours", "Local Crafts"],
      description: "Explore rich cultural heritage with walking tours supporting local artisans.",
      carbonSaved: "1.2 kg CO²"
    },
    {
      id: 5,
      name: "Lubao Bamboo Hub",
      location: "Lubao, Pampanga",
      rating: 4.4,
      ecoScore: 90,
      image: "🎋",
      tags: ["Bamboo Crafts", "Sustainable Materials", "Workshops"],
      description: "Learn about sustainable bamboo cultivation and traditional crafts.",
      carbonSaved: "2.1 kg CO²"
    },
    {
      id: 6,
      name: "Minalin River Eco-Park",
      location: "Minalin, Pampanga",
      rating: 4.3,
      ecoScore: 87,
      image: "🌊",
      tags: ["River Conservation", "Kayaking", "Mangrove Restoration"],
      description: "Support river conservation while enjoying eco-friendly water activities.",
      carbonSaved: "1.9 kg CO²"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sustainable Destinations
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Discover verified eco-friendly destinations that promote environmental conservation 
            and support local communities in Pampanga.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <Input 
                placeholder="Search destinations..." 
                className="bg-white/90 border-0 text-forest"
              />
              <Button variant="gold" size="lg">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-bold text-forest">
              {destinations.length} Eco-Certified Destinations
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Sort by Eco Score</Button>
            </div>
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

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-amber text-sm">⭐</span>
                      <span className="font-medium text-sm">{destination.rating}</span>
                    </div>
                    <div className="text-xs text-forest font-medium">
                      Saves {destination.carbonSaved} per visit
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="eco" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDestinationClick(destination)}
                    >
                      Visit
                    </Button>
                    <Button variant="outline" size="sm">
                      ❤️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Destinations;