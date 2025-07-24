import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Star, MapPin, Calendar, Users } from "lucide-react";
import { DestinationRatingModal } from "@/components/DestinationRatingModal";

// Import images
import bataanBeach from "@/assets/bataan-beach.jpg";
import tarlacTerraces from "@/assets/tarlac-terraces.jpg";
import nuevaEcijaCanopy from "@/assets/nueva-ecija-real-canopy.jpg";
import zambalesVillage from "@/assets/zambales-real-village.jpg";
import bulacanFarm from "@/assets/bulacan-farm.jpg";
import auroraCrater from "@/assets/aurora-real-crater.jpg";
import batangasWind from "@/assets/batangas-real-wind.jpg";
import caviteCoffee from "@/assets/cavite-real-coffee.jpg";
import rizalMangroves from "@/assets/rizal-mangroves.jpg";
import quezonResort from "@/assets/quezon-resort.jpg";
import lagunaPottery from "@/assets/laguna-real-pottery.jpg";
import pangasinanHerbs from "@/assets/pangasinan-real-herbs.jpg";
import batangasCoral from "@/assets/batangas-coral.jpg";
import subicTreehouse from "@/assets/subic-real-treehouse.jpg";
import ilocosWeaving from "@/assets/ilocos-real-weaving.jpg";
import manilaRooftop from "@/assets/manila-real-rooftop.jpg";

const Destinations = () => {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleDestinationClick = (destination: any) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const handleLearnMore = (destination: any) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const handleRateDestination = (destination: any) => {
    setSelectedDestination(destination);
    setIsRatingModalOpen(true);
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
    },
    {
      id: 7,
      name: "Subic Bay Eco-Beach Resort",
      location: "Subic Bay, Bataan",
      rating: 4.9,
      ecoScore: 96,
      image: bataanBeach,
      tags: ["Beach Conservation", "Marine Sanctuary", "Eco-Resort"],
      description: "Pristine beach with mangrove restoration and sustainable tourism practices.",
      carbonSaved: "3.8 kg CO²",
      detailedDescription: "Subic Bay Eco-Beach Resort combines luxury accommodation with environmental conservation. The resort features solar-powered facilities, organic waste management, and active participation in coral reef restoration and mangrove conservation programs.",
      openingHours: "24/7 Resort Access",
      bestTimeToVisit: "November to May",
      activities: ["Snorkeling", "Mangrove Tours", "Beach Cleanup", "Marine Education"],
      reviews: [
        { name: "Maria Gonzalez", rating: 5, comment: "Beautiful pristine beach with amazing conservation programs. The resort is truly eco-friendly.", date: "2024-02-05" },
        { name: "James Wilson", rating: 5, comment: "Excellent eco-resort with great marine sanctuary tours. Highly educational and relaxing.", date: "2024-02-03" },
        { name: "Sofia Chen", rating: 4, comment: "Love how they balance luxury with environmental responsibility. Great mangrove tours!", date: "2024-02-01" }
      ]
    },
    {
      id: 8,
      name: "Tarlac Heritage Rice Terraces",
      location: "Camiling, Tarlac", 
      rating: 4.7,
      ecoScore: 93,
      image: tarlacTerraces,
      tags: ["Sustainable Agriculture", "Cultural Heritage", "Rice Farming"],
      description: "Ancient rice terraces showcasing traditional sustainable farming methods.",
      carbonSaved: "2.3 kg CO²",
      detailedDescription: "The Tarlac Heritage Rice Terraces represent centuries of sustainable agricultural practices. Visitors can learn traditional farming techniques, participate in rice planting, and understand how ancient methods support both food security and environmental conservation.",
      openingHours: "6:00 AM - 6:00 PM",
      bestTimeToVisit: "June to November (Planting/Harvest Season)",
      activities: ["Rice Farming Experience", "Traditional Agriculture Tours", "Cultural Workshops", "Organic Farming Education"],
      reviews: [
        { name: "Ricardo Domingo", rating: 5, comment: "Incredible experience learning traditional farming. The terraces are breathtaking and the farmers are so knowledgeable.", date: "2024-02-07" },
        { name: "Alice Tan", rating: 4, comment: "Beautiful landscapes and educational farm tours. Great way to understand sustainable agriculture.", date: "2024-02-05" },
        { name: "Miguel Santos", rating: 5, comment: "Hands-on rice farming was amazing! Learned so much about traditional sustainable practices.", date: "2024-02-02" }
      ]
    },
    {
      id: 9,
      name: "Nueva Ecija Forest Canopy Walk",
      location: "Cabanatuan, Nueva Ecija",
      rating: 4.6,
      ecoScore: 89,
      image: nuevaEcijaCanopy,
      tags: ["Forest Conservation", "Canopy Walk", "Wildlife Observation"],
      description: "Suspended walkways through old-growth forest supporting reforestation efforts.",
      carbonSaved: "2.7 kg CO²",
      detailedDescription: "The Nueva Ecija Forest Canopy Walk offers visitors a unique perspective of the forest ecosystem while supporting local reforestation efforts. The suspended walkways minimize ground impact and provide excellent wildlife viewing opportunities.",
      openingHours: "7:00 AM - 5:00 PM",
      bestTimeToVisit: "December to April",
      activities: ["Canopy Walking", "Bird Watching", "Tree Planting", "Forest Education"],
      reviews: [
        { name: "Sandra Lopez", rating: 5, comment: "Incredible views from the canopy walk! Saw many birds and learned about forest conservation.", date: "2024-02-09" },
        { name: "Eduardo Ramos", rating: 4, comment: "Great conservation project. The walkway is well-built and the guides are very informative.", date: "2024-02-07" },
        { name: "Carmen Aguilar", rating: 5, comment: "Amazing experience walking through the treetops. Great for families and nature lovers.", date: "2024-02-04" }
      ]
    },
    {
      id: 10,
      name: "Zambales Fishing Village Sanctuary",
      location: "San Antonio, Zambales",
      rating: 4.8,
      ecoScore: 94,
      image: zambalesVillage,
      tags: ["Community Tourism", "Sustainable Fishing", "Cultural Exchange"],
      description: "Traditional fishing community promoting sustainable marine practices.",
      carbonSaved: "2.1 kg CO²",
      detailedDescription: "The Zambales Fishing Village Sanctuary showcases traditional Filipino fishing culture while promoting sustainable marine practices. Visitors can learn traditional fishing methods, participate in beach conservation, and enjoy authentic local cuisine.",
      openingHours: "5:00 AM - 7:00 PM",
      bestTimeToVisit: "October to March",
      activities: ["Traditional Fishing", "Beach Conservation", "Cultural Immersion", "Local Cuisine Tours"],
      reviews: [
        { name: "Roberto Cruz", rating: 5, comment: "Authentic cultural experience with friendly fishermen. Learned traditional sustainable fishing methods.", date: "2024-02-11" },
        { name: "Isabella Santos", rating: 4, comment: "Beautiful village with strong conservation values. The local food was incredible!", date: "2024-02-09" },
        { name: "Carlos Rivera", rating: 5, comment: "Great community-based tourism. Happy to support local fishermen and their conservation efforts.", date: "2024-02-06" }
      ]
    },
    {
      id: 11,
      name: "Bulacan Organic Farm Sanctuary",
      location: "San Miguel, Bulacan",
      rating: 4.5,
      ecoScore: 91,
      image: bulacanFarm,
      tags: ["Organic Farming", "Solar Energy", "Farm-to-Table"],
      description: "Solar-powered organic farm demonstrating sustainable agriculture practices.",
      carbonSaved: "3.1 kg CO²",
      detailedDescription: "Bulacan Organic Farm Sanctuary is a model of sustainable agriculture, using solar energy, organic farming methods, and water conservation techniques. Visitors can participate in farming activities and enjoy fresh farm-to-table meals.",
      openingHours: "8:00 AM - 5:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Organic Farming", "Solar Technology Tours", "Farm-to-Table Dining", "Composting Workshops"],
      reviews: [
        { name: "Ana Maria", rating: 5, comment: "Wonderful farm experience! Learned so much about organic farming and sustainable energy.", date: "2024-02-13" },
        { name: "Fernando Garcia", rating: 4, comment: "Great educational tour about sustainable agriculture. The farm-to-table lunch was delicious!", date: "2024-02-11" },
        { name: "Patricia Lim", rating: 4, comment: "Impressive solar installations and organic practices. Very inspiring for sustainable living.", date: "2024-02-08" }
      ]
    },
    {
      id: 12,
      name: "Aurora Crater Lake Eco-Lodge",
      location: "Baler, Aurora",
      rating: 4.7,
      ecoScore: 90,
      image: auroraCrater,
      tags: ["Crater Lake", "Eco-Lodge", "Volcanic Heritage"],
      description: "Pristine crater lake with sustainable accommodations and hiking trails.",
      carbonSaved: "2.9 kg CO²",
      detailedDescription: "Aurora Crater Lake Eco-Lodge offers visitors access to a stunning volcanic crater lake while maintaining strict environmental standards. The eco-lodge uses renewable energy and implements water conservation practices.",
      openingHours: "6:00 AM - 8:00 PM",
      bestTimeToVisit: "November to April",
      activities: ["Crater Lake Tours", "Hiking", "Eco-Lodge Stay", "Volcanic Education"],
      reviews: [
        { name: "David Kim", rating: 5, comment: "Breathtaking crater lake with excellent eco-lodge facilities. The hiking trails are well-maintained.", date: "2024-02-15" },
        { name: "Monica Reyes", rating: 4, comment: "Beautiful natural setting with responsible tourism practices. Great for nature photography.", date: "2024-02-13" },
        { name: "Antonio Silva", rating: 5, comment: "Amazing volcanic landscape and sustainable accommodations. Highly recommend for eco-tourists.", date: "2024-02-10" }
      ]
    },
    {
      id: 13,
      name: "Batangas Wind Farm Eco-Park",
      location: "Pililla, Batangas",
      rating: 4.4,
      ecoScore: 87,
      image: batangasWind,
      tags: ["Renewable Energy", "Wind Power", "Educational Tours"],
      description: "Wind turbine farm showcasing renewable energy technology and environmental education.",
      carbonSaved: "4.2 kg CO²",
      detailedDescription: "Batangas Wind Farm Eco-Park demonstrates the power of renewable energy through its massive wind turbines. The park offers educational tours about wind power technology and its role in combating climate change.",
      openingHours: "9:00 AM - 4:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Wind Farm Tours", "Renewable Energy Education", "Photography", "Environmental Workshops"],
      reviews: [
        { name: "Elena Rodriguez", rating: 4, comment: "Impressive wind turbines and great educational tour about renewable energy. Very informative.", date: "2024-02-17" },
        { name: "Jose Martinez", rating: 5, comment: "Amazing to see clean energy generation in action. The guides explained everything very well.", date: "2024-02-15" },
        { name: "Sara Wilson", rating: 4, comment: "Great educational experience about wind power. Beautiful views of the turbines against the sky.", date: "2024-02-12" }
      ]
    },
    {
      id: 14,
      name: "Cavite Heritage Coffee Farm",
      location: "Amadeo, Cavite",
      rating: 4.6,
      ecoScore: 88,
      image: caviteCoffee,
      tags: ["Coffee Farming", "Cultural Heritage", "Sustainable Agriculture"],
      description: "Traditional coffee plantation preserving heritage varieties and sustainable farming.",
      carbonSaved: "1.8 kg CO²",
      detailedDescription: "Cavite Heritage Coffee Farm preserves traditional Filipino coffee varieties while implementing sustainable farming practices. Visitors can learn about coffee cultivation, processing, and enjoy freshly roasted beans.",
      openingHours: "7:00 AM - 5:00 PM",
      bestTimeToVisit: "November to March (Harvest Season)",
      activities: ["Coffee Farm Tours", "Bean Roasting Workshops", "Coffee Tasting", "Sustainable Agriculture Education"],
      reviews: [
        { name: "Rafael Santos", rating: 5, comment: "Excellent coffee farm tour! Learned about traditional coffee varieties and sustainable farming methods.", date: "2024-02-19" },
        { name: "Carmen dela Cruz", rating: 4, comment: "Great coffee tasting experience and educational tour about heritage coffee cultivation.", date: "2024-02-17" },
        { name: "Miguel Torres", rating: 4, comment: "Beautiful coffee plantation with knowledgeable farmers. The fresh coffee was exceptional!", date: "2024-02-14" }
      ]
    },
    {
      id: 15,
      name: "Rizal Mangrove Conservation Park",
      location: "Tanay, Rizal",
      rating: 4.8,
      ecoScore: 95,
      image: rizalMangroves,
      tags: ["Mangrove Conservation", "Boardwalk Tours", "Marine Education"],
      description: "Floating boardwalks through mangrove forests supporting coastal protection.",
      carbonSaved: "3.3 kg CO²",
      detailedDescription: "Rizal Mangrove Conservation Park features extensive boardwalks through pristine mangrove forests. The park plays a crucial role in coastal protection and provides excellent opportunities for bird watching and marine education.",
      openingHours: "6:00 AM - 6:00 PM",
      bestTimeToVisit: "October to March",
      activities: ["Mangrove Boardwalk", "Bird Watching", "Marine Education", "Photography Tours"],
      reviews: [
        { name: "Luisa Garcia", rating: 5, comment: "Incredible mangrove boardwalk with amazing wildlife. Great conservation project!", date: "2024-02-21" },
        { name: "Pedro Aquino", rating: 5, comment: "Beautiful mangrove forest with excellent bird watching opportunities. Very educational.", date: "2024-02-19" },
        { name: "Maria Santos", rating: 4, comment: "Peaceful walk through the mangroves. Learned a lot about coastal conservation.", date: "2024-02-16" }
      ]
    },
    {
      id: 16,
      name: "Quezon Solar-Powered Eco-Resort",
      location: "Lucena, Quezon",
      rating: 4.5,
      ecoScore: 92,
      image: quezonResort,
      tags: ["Solar Energy", "Eco-Resort", "Sustainable Tourism"],
      description: "Luxury eco-resort powered entirely by renewable solar energy.",
      carbonSaved: "4.1 kg CO²",
      detailedDescription: "Quezon Solar-Powered Eco-Resort sets the standard for sustainable luxury tourism. The resort operates entirely on solar energy and features natural swimming pools, organic gardens, and zero-waste practices.",
      openingHours: "24/7 Resort Access",
      bestTimeToVisit: "Year-round",
      activities: ["Solar Technology Tours", "Organic Gardening", "Natural Swimming", "Sustainability Workshops"],
      reviews: [
        { name: "Amanda Lee", rating: 5, comment: "Amazing eco-resort with impressive solar installations. Luxury meets sustainability perfectly.", date: "2024-02-23" },
        { name: "Carlos Mendoza", rating: 4, comment: "Great example of sustainable tourism. The solar tour was fascinating and the facilities are top-notch.", date: "2024-02-21" },
        { name: "Isabella Rodriguez", rating: 5, comment: "Beautiful resort with strong environmental commitment. The natural pools are incredible!", date: "2024-02-18" }
      ]
    },
    {
      id: 17,
      name: "Laguna Traditional Pottery Village",
      location: "Tiaong, Laguna",
      rating: 4.3,
      ecoScore: 86,
      image: lagunaPottery,
      tags: ["Traditional Crafts", "Cultural Heritage", "Sustainable Materials"],
      description: "Artisan village preserving traditional pottery using sustainable clay sourcing.",
      carbonSaved: "1.5 kg CO²",
      detailedDescription: "Laguna Traditional Pottery Village maintains centuries-old pottery traditions while implementing sustainable clay sourcing and eco-friendly firing techniques. Visitors can learn traditional pottery methods and create their own pieces.",
      openingHours: "8:00 AM - 5:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Pottery Workshops", "Traditional Craft Tours", "Cultural Education", "Artisan Demonstrations"],
      reviews: [
        { name: "Rosa Dela Cruz", rating: 4, comment: "Wonderful pottery workshop! Learned traditional techniques from skilled artisans.", date: "2024-02-25" },
        { name: "Felipe Santos", rating: 5, comment: "Amazing cultural experience. The pottery masters are incredibly talented and welcoming.", date: "2024-02-23" },
        { name: "Grace Tan", rating: 4, comment: "Great hands-on pottery experience. Happy to support traditional artisans and sustainable crafts.", date: "2024-02-20" }
      ]
    },
    {
      id: 18,
      name: "Pangasinan Medicinal Plant Sanctuary",
      location: "Lingayen, Pangasinan",
      rating: 4.7,
      ecoScore: 91,
      image: pangasinanHerbs,
      tags: ["Medicinal Plants", "Traditional Medicine", "Botanical Conservation"],
      description: "Botanical sanctuary preserving traditional Filipino medicinal plants and knowledge.",
      carbonSaved: "2.2 kg CO²",
      detailedDescription: "Pangasinan Medicinal Plant Sanctuary preserves traditional Filipino herbal medicine knowledge while protecting endangered medicinal plant species. The sanctuary offers educational tours about traditional healing practices.",
      openingHours: "8:00 AM - 4:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Medicinal Plant Tours", "Traditional Medicine Workshops", "Botanical Education", "Herbal Tea Tasting"],
      reviews: [
        { name: "Dr. Marina Lopez", rating: 5, comment: "Fascinating sanctuary with incredible plant diversity. Great educational value for traditional medicine.", date: "2024-02-27" },
        { name: "Eduardo Ramos", rating: 4, comment: "Learned so much about traditional Filipino healing plants. The guides are very knowledgeable.", date: "2024-02-25" },
        { name: "Ana Gutierrez", rating: 5, comment: "Beautiful botanical sanctuary with important conservation work. The herbal tea tasting was wonderful.", date: "2024-02-22" }
      ]
    },
    {
      id: 19,
      name: "Batangas Coral Restoration Center",
      location: "Mabini, Batangas",
      rating: 4.9,
      ecoScore: 97,
      image: batangasCoral,
      tags: ["Marine Conservation", "Coral Restoration", "Diving Education"],
      description: "Marine research center actively restoring coral reefs through community programs.",
      carbonSaved: "3.7 kg CO²",
      detailedDescription: "Batangas Coral Restoration Center is at the forefront of marine conservation in the Philippines. The center conducts coral restoration research and offers educational diving programs to raise awareness about marine ecosystem protection.",
      openingHours: "7:00 AM - 5:00 PM",
      bestTimeToVisit: "November to May",
      activities: ["Coral Restoration Diving", "Marine Education", "Underwater Photography", "Research Participation"],
      reviews: [
        { name: "Captain Miguel Santos", rating: 5, comment: "Incredible coral restoration work! The diving experience is educational and inspiring.", date: "2024-03-01" },
        { name: "Dr. Sarah Kim", rating: 5, comment: "Outstanding marine conservation program. Great to see community involvement in coral restoration.", date: "2024-02-28" },
        { name: "Roberto Silva", rating: 4, comment: "Amazing underwater experience with important conservation message. Highly educational.", date: "2024-02-26" }
      ]
    },
    {
      id: 20,
      name: "Subic Sustainable Treehouse Village",
      location: "Olongapo, Subic",
      rating: 4.6,
      ecoScore: 89,
      image: subicTreehouse,
      tags: ["Treehouse Accommodation", "Forest Conservation", "Adventure Tourism"],
      description: "Elevated treehouse accommodations supporting forest conservation and wildlife protection.",
      carbonSaved: "2.8 kg CO²",
      detailedDescription: "Subic Sustainable Treehouse Village offers unique elevated accommodations while supporting forest conservation efforts. The treehouses are built using sustainable materials and provide minimal environmental impact.",
      openingHours: "24/7 Village Access",
      bestTimeToVisit: "December to April",
      activities: ["Treehouse Stay", "Canopy Tours", "Wildlife Observation", "Forest Conservation Programs"],
      reviews: [
        { name: "Adventure Couple Alex & Maya", rating: 5, comment: "Unique treehouse experience with amazing forest views. Great conservation project!", date: "2024-03-03" },
        { name: "Nature Guide Carlos", rating: 4, comment: "Well-designed treehouses with minimal environmental impact. Excellent wildlife viewing opportunities.", date: "2024-03-01" },
        { name: "Eco-Tourist Lisa", rating: 5, comment: "Incredible accommodation experience in the trees. Happy to support forest conservation efforts.", date: "2024-02-27" }
      ]
    },
    {
      id: 21,
      name: "Ilocos Traditional Textile Center",
      location: "Vigan, Ilocos Sur",
      rating: 4.4,
      ecoScore: 85,
      image: ilocosWeaving,
      tags: ["Traditional Textiles", "Cultural Heritage", "Sustainable Crafts"],
      description: "Heritage weaving center preserving traditional Filipino textile arts and techniques.",
      carbonSaved: "1.3 kg CO²",
      detailedDescription: "Ilocos Traditional Textile Center preserves the ancient art of Filipino weaving while promoting sustainable textile production. Visitors can learn traditional weaving techniques and purchase authentic handwoven products.",
      openingHours: "8:00 AM - 5:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Weaving Workshops", "Traditional Craft Tours", "Cultural Heritage Education", "Textile Shopping"],
      reviews: [
        { name: "Cultural Enthusiast Maria", rating: 4, comment: "Beautiful traditional weaving demonstration. Great way to preserve Filipino cultural heritage.", date: "2024-03-05" },
        { name: "Textile Artist Ramon", rating: 5, comment: "Incredible skill and artistry in traditional weaving. Happy to support local artisans.", date: "2024-03-03" },
        { name: "Heritage Tourist Sofia", rating: 4, comment: "Fascinating weaving techniques and beautiful textiles. Important cultural preservation work.", date: "2024-02-29" }
      ]
    },
    {
      id: 22,
      name: "Metro Manila Urban Rooftop Gardens",
      location: "Makati, Metro Manila",
      rating: 4.2,
      ecoScore: 83,
      image: manilaRooftop,
      tags: ["Urban Farming", "Vertical Gardens", "City Sustainability"],
      description: "Urban rooftop farming initiative promoting city sustainability and food security.",
      carbonSaved: "1.9 kg CO²",
      detailedDescription: "Metro Manila Urban Rooftop Gardens demonstrates how cities can become more sustainable through vertical farming and green infrastructure. The project showcases innovative urban agriculture techniques and environmental education.",
      openingHours: "9:00 AM - 4:00 PM",
      bestTimeToVisit: "Year-round",
      activities: ["Urban Farming Tours", "Vertical Garden Workshops", "Sustainability Education", "Fresh Harvest Tasting"],
      reviews: [
        { name: "Urban Planner Angela", rating: 4, comment: "Innovative urban farming project! Great example of city sustainability in action.", date: "2024-03-07" },
        { name: "Sustainability Advocate Pedro", rating: 5, comment: "Impressive vertical gardens and urban agriculture. Important for city food security.", date: "2024-03-05" },
        { name: "Environmental Student Grace", rating: 4, comment: "Educational tour about urban sustainability. Inspiring to see green solutions in the city.", date: "2024-03-02" }
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
            and support local communities across the Philippines.
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
                  <div className="w-16 h-16 overflow-hidden rounded-lg flex-shrink-0">
                    {typeof selectedDestination.image === 'string' && selectedDestination.image.includes('.jpg') ? (
                      <img 
                        src={selectedDestination.image} 
                        alt={selectedDestination.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-card">
                        {selectedDestination.image}
                      </div>
                    )}
                  </div>
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
                  <Button 
                    variant="eco" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateDestination(selectedDestination);
                    }}
                  >
                    ⭐ Rate It
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

      {/* Destination Rating Modal */}
      <DestinationRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        destination={selectedDestination}
      />

      <Footer />
    </div>
  );
};

export default Destinations;