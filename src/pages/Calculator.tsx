import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Calculator = () => {
  const [transportation, setTransportation] = useState("");
  const [distance, setDistance] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [activities, setActivities] = useState("");
  const [carbonFootprint, setCarbonFootprint] = useState(0);

  const calculateCarbon = () => {
    let total = 0;
    
    // Transportation calculation
    const dist = parseFloat(distance) || 0;
    switch (transportation) {
      case "car":
        total += dist * 0.2; // kg CO2 per km
        break;
      case "bus":
        total += dist * 0.05;
        break;
      case "bike":
        total += 0;
        break;
      case "walking":
        total += 0;
        break;
      default:
        total += dist * 0.15;
    }

    // Accommodation
    switch (accommodation) {
      case "eco-lodge":
        total += 5; // per night
        break;
      case "hotel":
        total += 15;
        break;
      case "camping":
        total += 1;
        break;
      default:
        total += 10;
    }

    // Activities
    switch (activities) {
      case "hiking":
        total += 2;
        break;
      case "cultural":
        total += 3;
        break;
      case "adventure":
        total += 8;
        break;
      default:
        total += 5;
    }

    setCarbonFootprint(total);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <div className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Carbon Footprint Calculator
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Calculate the environmental impact of your travel plans and discover 
            ways to make your trip more sustainable.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Calculator Form */}
            <Card className="shadow-eco">
              <CardHeader>
                <CardTitle className="text-2xl text-forest">Trip Calculator</CardTitle>
                <p className="text-muted-foreground">
                  Enter your travel details to calculate your carbon footprint
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transportation */}
                <div>
                  <Label htmlFor="transportation" className="text-forest font-medium">
                    Transportation Method
                  </Label>
                  <Select value={transportation} onValueChange={setTransportation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walking">Walking 🚶‍♂️</SelectItem>
                      <SelectItem value="bike">Bicycle 🚲</SelectItem>
                      <SelectItem value="bus">Public Bus 🚌</SelectItem>
                      <SelectItem value="car">Private Car 🚗</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle 🏍️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Distance */}
                <div>
                  <Label htmlFor="distance" className="text-forest font-medium">
                    Total Distance (km)
                  </Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="Enter distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Accommodation */}
                <div>
                  <Label htmlFor="accommodation" className="text-forest font-medium">
                    Accommodation Type
                  </Label>
                  <Select value={accommodation} onValueChange={setAccommodation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camping">Camping ⛺</SelectItem>
                      <SelectItem value="eco-lodge">Eco Lodge 🌿</SelectItem>
                      <SelectItem value="homestay">Homestay 🏠</SelectItem>
                      <SelectItem value="hotel">Regular Hotel 🏨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activities */}
                <div>
                  <Label htmlFor="activities" className="text-forest font-medium">
                    Main Activities
                  </Label>
                  <Select value={activities} onValueChange={setActivities}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select activities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hiking">Hiking & Nature 🥾</SelectItem>
                      <SelectItem value="cultural">Cultural Tours 🏛️</SelectItem>
                      <SelectItem value="adventure">Adventure Sports 🏄‍♂️</SelectItem>
                      <SelectItem value="relaxation">Relaxation 🧘‍♀️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateCarbon} 
                  className="w-full" 
                  variant="eco"
                  size="lg"
                >
                  Calculate Carbon Footprint
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {/* Result Card */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-2xl text-forest">Your Carbon Footprint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌍</div>
                    <div className="text-4xl font-bold text-forest mb-2">
                      {carbonFootprint.toFixed(1)} kg
                    </div>
                    <div className="text-lg text-muted-foreground mb-6">
                      CO₂ equivalent for this trip
                    </div>
                    
                    {carbonFootprint > 0 && (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${
                          carbonFootprint < 10 ? 'bg-green-100 border border-green-200' :
                          carbonFootprint < 25 ? 'bg-yellow-100 border border-yellow-200' :
                          'bg-red-100 border border-red-200'
                        }`}>
                          <div className="font-semibold mb-2">
                            {carbonFootprint < 10 ? '🌟 Excellent!' :
                             carbonFootprint < 25 ? '⚠️ Good' :
                             '🔴 High Impact'}
                          </div>
                          <div className="text-sm">
                            {carbonFootprint < 10 ? 'Your trip has a low environmental impact!' :
                             carbonFootprint < 25 ? 'Consider some eco-friendly alternatives.' :
                             'Your trip has a high carbon footprint.'}
                          </div>
                        </div>
                        
                        <Button variant="gold" className="w-full">
                          Get Green Points: +{Math.round(Math.max(50 - carbonFootprint, 10))}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-xl text-forest">Eco-Friendly Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500">🚲</span>
                      <div>
                        <div className="font-medium text-sm">Use Sustainable Transport</div>
                        <div className="text-xs text-muted-foreground">
                          Choose walking, cycling, or public transport when possible
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500">🌿</span>
                      <div>
                        <div className="font-medium text-sm">Stay at Eco-Lodges</div>
                        <div className="text-xs text-muted-foreground">
                          Choose accommodations with green certifications
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500">🏪</span>
                      <div>
                        <div className="font-medium text-sm">Support Local Businesses</div>
                        <div className="text-xs text-muted-foreground">
                          Buy from local vendors and eat at community restaurants
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-green-500">♻️</span>
                      <div>
                        <div className="font-medium text-sm">Minimize Waste</div>
                        <div className="text-xs text-muted-foreground">
                          Bring reusable items and follow Leave No Trace principles
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Calculator;