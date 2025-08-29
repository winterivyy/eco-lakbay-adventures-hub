import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const Calculator = () => {
  const [transportation, setTransportation] = useState("");
  const [distance, setDistance] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [numberOfNights, setNumberOfNights] = useState("1"); // State for number of nights
  const [carbonFootprint, setCarbonFootprint] = useState(0);

  const calculateCarbon = () => {
    let total = 0;
    const dist = parseFloat(distance) || 0;
    const nights = parseInt(numberOfNights) || 1;

    // --- ACCURATE TRANSPORTATION CALCULATION (in kg CO2e per passenger-km) ---
    // These values are estimates based on data for the Philippines and regional averages.
    switch (transportation) {
      case "car":
        total += dist * 0.17; // Average for a gasoline car
        break;
      case "bus":
        total += dist * 0.03; // Efficient due to high passenger occupancy
        break;
      case "motorcycle":
        total += dist * 0.07; // Very common transport mode
        break;
      case "tricycle":
        total += dist * 0.1; // Less fuel-efficient than motorcycles
        break;
      case "jeepney":
        total += dist * 0.08; // Iconic Filipino transport; emissions can be high but shared
        break;
      case "ferry":
        total += dist * 0.15; // For inter-island travel
        break;
      case "bike":
        total += 0;
        break;
      case "walking":
        total += 0;
        break;
      default:
        total += dist * 0.1; // A conservative default
    }

    // --- ACCURATE ACCOMMODATION CALCULATION (in kg CO2e per person per night) ---
    switch (accommodation) {
      case "hotel":
        total += nights * 25; // Average estimate for a standard hotel in the Philippines
        break;
      case "eco-lodge":
        total += nights * 10; // Assumes use of renewable energy and sustainable practices
        break;
      case "homestay":
        total += nights * 5; // Lower impact, closer to a local resident's footprint
        break;
      case "camping":
        total += nights * 2; // Minimal energy and resource use
        break;
      default:
        total += nights * 15; // A general default
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
                <CardTitle className="text-2xl text-forest">
                  Trip Calculator
                </CardTitle>
                <p className="text-muted-foreground">
                  Enter your travel details to calculate your carbon footprint
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transportation */}
                <div>
                  <Label
                    htmlFor="transportation"
                    className="text-forest font-medium"
                  >
                    Transportation Method
                  </Label>
                  <Select
                    value={transportation}
                    onValueChange={setTransportation}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walking">Walking 🚶‍♂️</SelectItem>
                      <SelectItem value="bike">Bicycle 🚲</SelectItem>
                      <SelectItem value="jeepney">Jeepney 🚌</SelectItem>
                      <SelectItem value="tricycle">Tricycle 🛺</SelectItem>
                      <SelectItem value="bus">Public Bus 🚍</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle 🏍️</SelectItem>
                      <SelectItem value="car">Private Car 🚗</SelectItem>
                      <SelectItem value="ferry">Ferry 🛳️</SelectItem>
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
                  <Label
                    htmlFor="accommodation"
                    className="text-forest font-medium"
                  >
                    Accommodation Type
                  </Label>
                  <Select
                    value={accommodation}
                    onValueChange={setAccommodation}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camping">Camping ⛺</SelectItem>
                      <SelectItem value="homestay">Homestay 🏠</SelectItem>
                      <SelectItem value="eco-lodge">Eco Lodge 🌿</SelectItem>
                      <SelectItem value="hotel">Regular Hotel 🏨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Nights */}
                <div>
                  <Label
                    htmlFor="nights"
                    className="text-forest font-medium"
                  >
                    Number of Nights
                  </Label>
                  <Input
                    id="nights"
                    type="number"
                    placeholder="e.g., 3"
                    value={numberOfNights}
                    onChange={(e) => setNumberOfNights(e.target.value)}
                    className="mt-2"
                  />
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

            {/* --- Results and Tips sections remain the same --- */}
            
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Calculator;
