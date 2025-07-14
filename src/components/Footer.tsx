import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Destinations", path: "/destinations" },
        { label: "Calculator", path: "/calculator" },
        { label: "Community", path: "/community" },
        { label: "Dashboard", path: "/dashboard" }
      ]
    },
    {
      title: "For Businesses",
      links: [
        { label: "Register Business", path: "/register-destination" },
        { label: "Eco Certification", path: "/certification" },
        { label: "Partner Program", path: "/partners" },
        { label: "Resources", path: "/business-resources" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", path: "/help" },
        { label: "Contact Us", path: "/contact" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" }
      ]
    }
  ];

  return (
    <footer className="bg-forest text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">EcoLakbay</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Transforming tourism in Pampanga through sustainable practices, 
              community engagement, and environmental responsibility.
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                📱
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                🐦
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                📘
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                📸
              </button>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.path} 
                      className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 EcoLakbay. All rights reserved. Made with 🌱 for sustainable tourism.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-white/60 text-sm">Powered by</span>
              <div className="flex items-center space-x-2">
                <span className="text-amber">⚡</span>
                <span className="text-sm font-medium">Green Technology</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;