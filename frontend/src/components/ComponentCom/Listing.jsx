import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { Calendar, Users, MapPin, ShoppingCart, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const Listing = ({ cart, setCart }) => {
  const { logout } = useAuthStore();
  // Equipment Data
  const labEquipment = [
    {
      id: 1,
      title: "Laser Cutter",
      specs: "100W CO2 Glass Laser, 1200x900mm area, with Chiller & software",
      qty: 1,
      category: "Mandatory Machines",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYtry_qXIlb45I6Fq8u0riXbn9gPG2vrO_pg&s",
    },
    {
      id: 2,
      title: "Vinyl Cutter",
      specs: "Max cut size 11.5 x 23.5, speed 14.1 ips + Stand",
      qty: 1,
      category: "Mandatory Machines",
      location: "IDEA LAB",
      available: false,
      nextAvailable: "2025-02-15",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRtpWc9DAQWtuuX2EqjO775_gzizPE9xdXNw&s",
    },
    {
      id: 3,
      title: "3D Printer (Open)",
      specs: "FDM, 300×300×330 mm volume, 600mm/s speed",
      qty: 3,
      category: "Mandatory Machines",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://images.thdstatic.com/productImages/a2113aae-a0fd-4352-8971-6d9520878c59/svn/black-lukyamzn-printers-sa10-327b148-64_600.jpg",
    },
    {
      id: 4,
      title: "3D Printer (Enclosed)",
      specs: "Core XY, 310×310×310 mm volume, 550 mm/s",
      qty: 1,
      category: "Mandatory Machines",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "data:image/jpeg;base64,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",
    },
    {
      id: 5,
      title: "3D Scanner",
      specs: "Blue Light & NIR Mode, 0.02mm accuracy",
      qty: 1,
      category: "Mandatory Machines",
      location: "IDEA LAB",
      available: false,
      nextAvailable: "2025-02-12",
      image: "https://make3d.in/wp-content/uploads/2025/04/einscan-h2-3d-scanner.jpg",
    },
    {
      id: 6,
      title: "CNC Router",
      specs: "1300×2500 mm area, 3KW spindle, vacuum bed",
      qty: 1,
      category: "Mandatory Machines",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "data:image/jpeg;base64,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rgHNOoIqD3gr2iCGX3yc2SapirA/4M2V7WH9iFr++9h7bZanBzsY9uKpy7W9Yeq3miDm2yWd8rxGwVeSQBUDMAk69xXy8LEYnGN46TaYxlkSK08AR41W+b52WslqzkiAk3SM6MgO44hr4qAbQcmloaS+CTnwcyHmknmcnHyVo1/YppIH44ZHxO4sJHnTUd9VOLm5T7TFQWhjZ2+8Oi/vyGE+QUNtlikhdhlY6N3uuBB8OI7Qrcqjedx7e2G1UaJRHIfYl6Lq8AT0XeBUnquYZIw4UIrVXN0bSXjYPwJ3Fg9h3Tj7sLs2/wBNFINg8um0XNwssjD0pPvJfyNPRb/U/P8AoK07cNgM8rWe8c+7U+n1VxtNe8tutDp5aY3UqBWgAFA1tdAP3U25J7h52QOIBBND+RubvPJviEG4Nk7vENnYKULuke4gBo78IHjVZlEUBERAREQEREBERAREQEREBERAREQEREBERAREQW1vsEU7cEsbZG8HAHy4FQW/OS6F9XWaQxH3H1czwPWHqthog58vvZa12SplhOAf9xnSZ5jTxosKM106QontLsHZrU1xja2GY5iRjcq/E0EA146q0aftl1Wf7O2UStkkeWtcylHR5Ocd9fZAqe2mq25yaXQILMHYaYgA3jQauPaXV8GtUQ2i2StLRDEyyANDgHyREuDi7C2rgekAMznpiOfHbNkgEbGsGjGho8BRBWREUBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERB//9k=",
    },
    {
      id: 7,
      title: "Mini Desktop Lathe",
      specs: "100mm swing, 230W motor, 100–1000 RPM",
      qty: 1,
      category: "Mechanical Tools",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg?auto=compress&cs=tinysrgb&w=500",
    },
    {
      id: 8,
      title: "Drilling Machine",
      specs: "1 HP motor, 160mm depth",
      qty: 1,
      category: "Mechanical Tools",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpug1JrsAKa2gWPLsHAfwqSTkZZhw_j0nfPQ&s",
    },
    {
      id: 9,
      title: "Benchtop Grinder",
      specs: "350W, 150mm wheel, 3000 rpm",
      qty: 1,
      category: "Mechanical Tools",
      location: "IDEA LAB",
      available: false,
      nextAvailable: "2025-02-12",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSevszQI0efmXsfglcaUlA24LAHi27Tb1H1iQ&s",
    },
    {
      id: 10,
      title: "Soldering Station",
      specs: "60W, 200°C–480°C",
      qty: 5,
      category: "Electronic Tools",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://5.imimg.com/data5/SELLER/Default/2025/12/565658279/TH/YH/WU/4265115/feeder-soldering-station-250x250.jpg",
    },
    {
      id: 11,
      title: "Mixed Signal Oscilloscope",
      specs: "100 MHz, 4 Channels, 1 GSa/s",
      qty: 1,
      category: "Electronic Tools",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoVX5ZOmKTj4e1QTNllldI-Slwd8Awg-MVMw&s",
    },
    {
      id: 12,
      title: "Digital Storage Oscilloscope",
      specs: "2 Channel, 1 GSa/s",
      qty: 1,
      category: "Electronic Tools",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKyQXBebjtYs0xCRAwDb1YjEa-xKg0lW6Vuw&s",
    },
    {
      id: 13,
      title: "Computer Workstation",
      specs: "i7, 32GB RAM, 1TB SSD, RTX 3050",
      qty: 4,
      category: "Computing",
      location: "IDEA LAB",
      available: true,
      nextAvailable: null,
      image: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=500",
    },
    {
      id: 14,
      title: "Networking Workstation",
      specs: "i9-14900K, 64GB DDR5, RTX 5090",
      qty: 1,
      category: "Computing",
      location: "IDEA LAB",
      available: false,
      nextAvailable: "2025-02-13",
      image: "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=500",
    },
  ];

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);


  // Filter equipment
  const filteredEquipment = labEquipment.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);

    return matchesSearch && matchesCategory;
  });

  // Handle Add to Cart
  const handleAddToCart = (item) => {
    if (!cart.find((cartItem) => cartItem.id === item.id)) {
      setCart([...cart, item]);
      alert(`${item.title} added to cart!`);
    } else {
      alert(`${item.title} is already in the cart.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - passing cart count if your Navbar supports it */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartCount={cart.length} />

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            categoryOpen={categoryOpen}
            setCategoryOpen={setCategoryOpen}
            typeOpen={typeOpen}
            setTypeOpen={setTypeOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Home / Lab Equipment
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Lab Equipment
                  </h1>
                  <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                    {filteredEquipment.length} Items
                  </span>
                </div>
                {/* Cart Status Indicator */}
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart: {cart.length} items</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors ml-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {/* Equipment Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/500x400/e5e7eb/6b7280?text=" + encodeURIComponent(item.title);
                      }}
                    />
                    {!item.available && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        In Use
                      </div>
                    )}
                    {item.available && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Available
                      </div>
                    )}
                  </div>

                  {/* Equipment Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.specs}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>Quantity: {item.qty}</span>
                      </div>
                      {!item.available && item.nextAvailable && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Calendar className="w-4 h-4" />
                          <span>Next available: {item.nextAvailable}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${item.available
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        disabled={!item.available}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {item.available ? "Request Access" : "Unavailable"}
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredEquipment.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No equipment found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Listing;