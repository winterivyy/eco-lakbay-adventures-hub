import { Card, CardContent } from "@/components/ui/card";

const StatsSection = () => {
  const stats = [
    {
      number: "500+",
      label: "Eco-Certified Destinations",
      icon: "🌿"
    },
    {
      number: "2,500+",
      label: "Active Eco-Travelers",
      icon: "👥"
    },
    {
      number: "15,000",
      label: "Tons CO² Saved",
      icon: "🌍"
    },
    {
      number: "50+",
      label: "Local Partners",
      icon: "🤝"
    }
  ];

  return (
    <section className="py-20 bg-forest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Making a Real Impact
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Together, we're building a more sustainable future for tourism in the Philippines.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
