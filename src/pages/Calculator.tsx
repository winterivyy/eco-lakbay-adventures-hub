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

// --- REFACTOR #1: Move emission factors to a constant for clarity and maintenance ---
// Source: Based on averages from various sources like EPA, Our World in Data.
// These are illustrative and should be cited.
const EMISSION_FACTORS = {
  transport: {
    // These are kg CO2e per VEHICLE-kilometer. We will divide by passengers.
    car: 0.17,
    bus: 1.5,     // A bus has high total emissions, but is efficient when shared.
    motorcycle: 0.07,
    tricycle: 0.1,
    jeepney: 0.8,   // Similar to a bus but smaller.
    ferry: 25.0,  // Ferries vary wildly; this is just an example factor per km.
    // These are per PASSENGER-kilometer (or effectively zero).
    bike: 0,
    walking: 0,
  },
  accommodation: {
    // kg CO2e per night per person.
    hotel: 12.5,
    ecoLodge: 5,
    guesthouse: 8,
  },
};


const Calculator = () => {
  const [transportation, setTransportation] = useState("");
  const [distance, setDistance] = useState("");
  // --- IMPROVEMENT #1: Add state for passengers and accommodation ---
  const [passengers, setPassengers] = useState("1");
  const [accommodation, setAccommodation] = useState("");
  const [nights, setNights] = useState("0");

  const [carbonFootprint, setCarbonFootprint] = useState(0);

  const calculateCarbon = () => {
    let total = 0;
    const dist = parseFloat(distance) || 0;
    const numPassengers = parseInt(passengers) || 1;
    const numNights = parseInt(nights) || 0;

    // --- TRANSPORTATION CALCULATION ---
    const transportFactor = EMISSION_FACTORS.transport[transportation] || 0;
    if (["car", "bus", "motorcycle", "tricycle", "jeepney", "ferry"].includes(transportation)) {
      // For shared vehicles, divide total vehicle emissions by number of passengers
      total += (dist * transportFactor) / numPassengers;
    } else {
      // For walking/biking, it's already per person (zero)
      total += dist * transportFactor;
    }

    // --- IMPROVEMENT #2: Add accommodation calculation ---
    const accommodationFactor = EMISSION_FACTORS.accommodation[accommodation] || 0;
    total += numNights * accommodationFactor;


    setCarbonFootprint(total);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-gradient-hero py-20">
        {/* Header is great, no changes needed */}
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <Card className="shadow-eco">
              <CardHeader>
                <CardTitle className="text-2xl text-forest">Trip Calculator</CardTitle>
                <p className="text-muted-foreground">Enter your trip details to get an estimate.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* --- Form Section for Transportation --- */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-medium text-forest px-2">Transportation</legend>
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="transportation" className="font-medium">Method</Label>
                            <Select value={transportation} onValueChange={setTransportation}>
                                {/* ... SelectItems remain the same */}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="distance" className="font-medium">Total Distance (km)</Label>
                            <Input id="distance" type="number" placeholder="e.g., 150" value={distance} onChange={(e) => setDistance(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="passengers" className="font-medium">Number of People Traveling</Label>
                            <Input id="passengers" type="number" placeholder="e.g., 2" value={passengers} onChange={(e) => setPassengers(e.target.value)} />
                        </div>
                    </div>
                </fieldset>

                {/* --- Form Section for Accommodation --- */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-medium text-forest px-2">Accommodation</legend>
                    <div className="space-y-4 pt-2">
                         <div>
                            <Label htmlFor="accommodation" className="font-medium">Accommodation Type</Label>
                             <Select value={accommodation} onValueChange={setAccommodation}>
                                <SelectTrigger><SelectValue placeholder="Select accommodation type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hotel">Hotel</SelectItem>
                                    <SelectItem value="ecoLodge">Eco-Lodge</SelectItem>
                                    <SelectItem value="guesthouse">Guesthouse / Rental</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="nights" className="font-medium">Number of Nights</Label>
                            <Input id="nights" type="number" placeholder="e.g., 3" value={nights} onChange={(e) => setNights(e.target.value)} />
                        </div>
                    </div>
                </fieldset>


                <Button onClick={calculateCarbon} className="w-full" variant="eco" size="lg">
                  Calculate Carbon Footprint
                </Button>
              </CardContent>
            </Card>

            {/* Results & Tips Section */}
            <div className="space-y-6">
              {carbonFootprint > 0 && (
                <Card className="shadow-eco">
                    {/* ... Your results display is great, but let's add the source note ... */}
                    <CardContent>
                        {/* ... Your existing results content ... */}
                        <div className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
                            <b>Disclaimer:</b> This is an estimate. Emission factors are based on general averages and do not account for specific vehicle models, fuel types, or traffic.
                        </div>
                    </CardContent>
                </Card>
              )}
              {/* ... Your tips card is great, no changes needed ... */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Calculator;
