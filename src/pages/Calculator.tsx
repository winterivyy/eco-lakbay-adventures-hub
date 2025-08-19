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
    const dist = parseFloat(distance) || 0;

    // 1. Transportation calculation (kg CO2 per km)
    const transportFactors = {
      "car": 0.2, // Using original values
      "bus": 0.05,
      "motorcycle": 0.11, // Added case
      "bike": 0,
      "walking": 0,
    };
    total += (transportFactors[transportation] ?? 0.15) * dist;

    // 2. Accommodation (flat value per trip)
    const accommodationFactors = {
      "eco-lodge": 5,
      "hotel": 15,
      "camping": 1,
      "homestay": 10, // Added case
    };
    total += accommodationFactors[accommodation] ?? 10;

    // 3. Activities (flat value per trip)
    const activityFactors = {
      "hiking": 2,
      "cultural": 3,
      "adventure": 8,
      "relaxation": 4, // Added case
    };
    total += activityFactors[activities] ?? 5;

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
                      <SelectItem value="motorcycle">Motorcycle 🏍️</SelectItem>
                      <SelectItem value="car">Private Car 🚗</SelectItem>
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

            {/* Results (No changes needed here) */}
            <div className="space-y-6">
                {/* ... (rest of the results UI remains the same) ... */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Calculator;
