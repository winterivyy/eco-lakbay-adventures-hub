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
  const [travelers, setTravelers] = useState("1");
  const [carbonFootprint, setCarbonFootprint] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState("");

  const calculateCarbon = () => {
    const dist = parseFloat(distance) || 0;
    const people = parseInt(travelers) || 1;
    let total = 0;

    // Emission factors (kg CO2e per passenger-km)
    const emissionFactors: Record<string, number> = {
      car: 0.17,
      bus: 0.03,
      motorcycle: 0.07,
      tricycle: 0.1,
      jeepney: 0.08,
      ferry: 0.15,
      bike: 0,
      walking: 0,
    };

    const factor = emissionFactors[transportation] || 0.1;
    total = (dist * factor) / people;

    // Suggest eco-alternatives
    const ecoTips: Record<string, string> = {
      car: "Try carpooling or switching to public transport for shorter trips.",
      bus: "Great choice! Public transport helps reduce emissions.",
      motorcycle: "Consider taking a bus or sharing rides when possible.",
      tricycle: "Opt for walking or biking for short distances.",
      jeepney: "You're already supporting local transport—try avoiding idling time.",
      ferry: "Consider offsetting your ferry trip by supporting mangrove projects.",
      bike: "Zero emissions! Keep cycling! 🚴",
      walking: "You’re traveling the most sustainable way possible. 🌿",
    };

    setSuggestion(ecoTips[transportation] || "");
    setCarbonFootprint(total);
  };

  // Helper to get rating and color
  const getImpact = (value: number) => {
    if (value < 10)
      return {
        label: "🌱 Excellent! Low impact",
        color: "bg-green-100 border border-green-200",
      };
    if (value < 25)
      return {
        label: "⚠️ Moderate impact",
        color: "bg-yellow-100 border border-yellow-200",
      };
    return {
      label: "🚨 High impact",
      color: "bg-red-100 border border-red-200",
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <div className="bg-gradient-hero py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Carbon Footprint Calculator
        </h1>
        <p className="text-lg max-w-3xl mx-auto">
          Estimate the carbon impact of your travel and discover eco-friendly
          alternatives to make your trip more sustainable.
        </p>
      </div>

      {/* Calculator Section */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <Card className="shadow-eco">
            <CardHeader>
              <CardTitle className="text-2xl text-forest">
                Trip Calculator
              </CardTitle>
              <p className="text-muted-foreground">
                Enter your travel details to estimate your carbon footprint.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Transportation */}
              <div>
                <Label htmlFor="transportation" className="text-forest font-medium">
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

              {/* Number of Travelers */}
              <div>
                <Label htmlFor="travelers" className="text-forest font-medium">
                  Number of Travelers
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  placeholder="e.g., 2"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button onClick={calculateCarbon} className="w-full" variant="eco" size="lg">
                Calculate Carbon Footprint
              </Button>
            </CardContent>
          </Card>

          {/* Right Side - Results */}
          <div className="space-y-6">
            {carbonFootprint !== null && (
              <Card className="shadow-eco">
                <CardHeader>
                  <CardTitle className="text-2xl text-forest text-center">
                    Your Estimated Carbon Footprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl mb-2">🌍</div>
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {carbonFootprint.toFixed(2)} kg CO₂e
                  </div>
                  <div className={`p-3 rounded-lg mb-3 ${getImpact(carbonFootprint).color}`}>
                    {getImpact(carbonFootprint).label}
                  </div>

                  {/* Real-world Equivalent */}
                  <div className="text-sm text-muted-foreground mb-4">
                    Equivalent to keeping a 60W light bulb on for{" "}
                    <strong>{(carbonFootprint * 5).toFixed(0)}</strong> hours.
                  </div>

                  {/* Visual Comparison Bar */}
                  <div className="my-4">
                    <Label className="text-forest font-semibold">Comparison (kg CO₂e)</Label>
                    <div className="w-full bg-gray-100 rounded-full h-4 mt-2 relative">
                      <div
                        className="bg-emerald-500 h-4 rounded-full"
                        style={{ width: `${Math.min(carbonFootprint * 3, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      More bar = higher environmental impact.
                    </p>
                  </div>

                  {/* Eco Suggestion */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                    <span className="font-semibold text-green-700">Eco Suggestion:</span>{" "}
                    {suggestion}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Eco Tips */}
            <Card className="shadow-eco">
              <CardHeader>
                <CardTitle className="text-xl text-forest">Eco-Friendly Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>🚲 Choose walking, cycling, or public transport whenever possible.</li>
                  <li>♻️ Bring reusable bottles and avoid single-use plastics.</li>
                  <li>🌿 Support eco-certified and local tourism establishments.</li>
                  <li>🕯️ Turn off lights, A/C, and electronics when not in use.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Calculator;
