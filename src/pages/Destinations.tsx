import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Star, MapPin, Calendar, Users } from "lucide-react";

const Destinations = () => {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDestinationClick = (destination: any) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
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
      carbonSaved: "2.5 kg CO²",
      detailedDescription: "Mount Arayat National Park is a stunning natural sanctuary that offers visitors an authentic eco-tourism experience. The park features well-maintained hiking trails, diverse wildlife viewing opportunities, and sustainable accommodation options that minimize environmental impact.",
      openingHours: "6:00 AM - 6:00 PM",
      bestTimeToVisit: "October to March",
      activities: ["Hiking", "Wildlife Photography", "Eco-Lodge Stay", "Nature Walks"],
      reviews: [
        { name: "Maria Santos", rating: 5, comment: "Amazing experience! The eco-lodge was comfortable and the hiking trails were well-maintained. Saw many beautiful birds and butterflies.", date: "2024-01-15" },
        { name: "John Rivera", rating: 5, comment: "Perfect for nature lovers. The staff is knowledgeable about conservation efforts and the views from the summit are breathtaking.", date: "2024-01-10" },
        { name: "Ana Garcia", rating: 4, comment: "Great facilities and very clean. The guided tour was informative about local wildlife conservation.", date: "2024-01-05" }
      ]
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
      carbonSaved: "1.8 kg CO²",
      detailedDescription: "Candaba Wetlands is a critical stopover for migratory birds along the East Asian-Australasian Flyway. This internationally recognized birding destination offers visitors the chance to observe over 80 species of birds while supporting local conservation efforts.",
      openingHours: "5:00 AM - 7:00 PM",
      bestTimeToVisit: "November to February",
      activities: ["Birdwatching", "Photography", "Guided Tours", "Educational Programs"],
      reviews: [
        { name: "Pedro Aquino", rating: 5, comment: "Incredible diversity of birds! The guides were very knowledgeable and passionate about conservation.", date: "2024-01-20" },
        { name: "Lisa Chen", rating: 4, comment: "Beautiful wetlands with amazing wildlife. Educational tour taught us a lot about bird migration patterns.", date: "2024-01-18" },
        { name: "Mark Torres", rating: 5, comment: "A must-visit for bird enthusiasts. Saw some rare species and learned about local conservation efforts.", date: "2024-01-12" }
      ]
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
      carbonSaved: "3.2 kg CO²",
      detailedDescription: "Clark Green City represents the future of sustainable urban development in the Philippines. This master-planned city integrates green technologies, renewable energy systems, and sustainable transportation to create a model for eco-friendly urban living.",
      openingHours: "24/7 (Tours: 9:00 AM - 5:00 PM)",
      bestTimeToVisit: "Year-round",
      activities: ["Green Architecture Tours", "Solar Farm Visits", "Sustainable Transport", "Educational Centers"],
      reviews: [
        { name: "Sarah Kim", rating: 5, comment: "Fascinating to see sustainable city planning in action. The solar installations and green buildings are impressive.", date: "2024-01-25" },
        { name: "Carlos Mendoza", rating: 4, comment: "Great example of how cities can be environmentally friendly. The guided tour was very informative.", date: "2024-01-22" },
        { name: "Elena Reyes", rating: 5, comment: "Inspiring urban development project. Shows that progress and sustainability can go hand in hand.", date: "2024-01-19" }
      ]
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
      carbonSaved: "1.2 kg CO²",
      detailedDescription: "San Fernando Heritage District preserves the rich cultural history of Pampanga while promoting sustainable tourism. The district features beautifully preserved colonial architecture, traditional craft workshops, and walking tours that support local communities.",
      openingHours: "8:00 AM - 6:00 PM",
      bestTimeToVisit: "December to February",
      activities: ["Heritage Walking Tours", "Craft Workshops", "Local Food Tours", "Cultural Shows"],
      reviews: [
        { name: "Rosa Dela Cruz", rating: 5, comment: "Beautiful heritage buildings and friendly local artisans. Learned so much about Kapampangan culture.", date: "2024-01-28" },
        { name: "Miguel Santos", rating: 4, comment: "Nice walking tour with knowledgeable guides. Great way to support local craftspeople.", date: "2024-01-26" },
        { name: "Grace Tan", rating: 4, comment: "Wonderful cultural experience. The traditional crafts demonstration was particularly interesting.", date: "2024-01-23" }
      ]
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
      carbonSaved: "2.1 kg CO²",
      detailedDescription: "Lubao Bamboo Hub showcases the versatility and sustainability of bamboo as a material for construction, crafts, and everyday items. Visitors can participate in hands-on workshops and learn about bamboo cultivation techniques that support environmental conservation.",
      openingHours: "9:00 AM - 5:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Bamboo Crafting Workshops", "Plantation Tours", "Sustainable Building Demos", "Educational Programs"],
      reviews: [
        { name: "Jose Martinez", rating: 5, comment: "Amazing to see what can be made from bamboo! The workshop was hands-on and fun.", date: "2024-01-30" },
        { name: "Carmen Lopez", rating: 4, comment: "Educational and eco-friendly experience. Learned about bamboo as a sustainable alternative to traditional materials.", date: "2024-01-27" },
        { name: "David Ng", rating: 4, comment: "Great initiative promoting sustainable materials. The plantation tour was very informative.", date: "2024-01-24" }
      ]
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
      carbonSaved: "1.9 kg CO²",
      detailedDescription: "Minalin River Eco-Park is a community-based conservation project that protects the local river ecosystem while providing sustainable recreational activities. The park features mangrove restoration areas, eco-friendly kayaking tours, and educational programs about river conservation.",
      openingHours: "7:00 AM - 5:00 PM",
      bestTimeToVisit: "November to April",
      activities: ["Kayaking Tours", "Mangrove Planting", "River Cleanup", "Wildlife Observation"],
      reviews: [
        { name: "Angela Cruz", rating: 5, comment: "Peaceful kayaking experience with knowledgeable guides about river conservation. Saw beautiful mangroves.", date: "2024-02-01" },
        { name: "Roberto Silva", rating: 4, comment: "Great conservation initiative. The mangrove restoration project is impressive and important work.", date: "2024-01-29" },
        { name: "Nina Fernandez", rating: 4, comment: "Relaxing river tour with an educational component. Happy to support conservation efforts.", date: "2024-01-21" }
      ]
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
              <Card 
                key={destination.id} 
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                onClick={() => handleDestinationClick(destination)}
              >
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

      {/* Destination Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDestination && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{selectedDestination.image}</div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl text-forest mb-2">
                      {selectedDestination.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedDestination.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-accent text-white border-0">
                    {selectedDestination.ecoScore}% Eco
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-forest mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedDestination.detailedDescription}
                  </p>
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-forest" />
                      <span className="font-medium">Opening Hours</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedDestination.openingHours}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-forest" />
                      <span className="font-medium">Best Time to Visit</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedDestination.bestTimeToVisit}</p>
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-forest mb-3">Activities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.activities.map((activity: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reviews Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-forest">Tourist Reviews</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber text-amber" />
                      <span className="font-medium">{selectedDestination.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({selectedDestination.reviews.length} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedDestination.reviews.map((review: any, index: number) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-forest">{review.name}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-amber text-amber"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="eco" className="flex-1">
                    Book Experience
                  </Button>
                  <Button variant="outline">
                    ❤️ Save
                  </Button>
                  <Button variant="outline">
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Destinations;