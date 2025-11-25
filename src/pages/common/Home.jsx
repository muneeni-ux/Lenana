import React, { useContext, useEffect } from "react";
import { Droplets, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../components/common/ThemeContext";

function Home() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  // Ensure HTML class reflects current theme
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
  }, [theme]);

  const products = [
    {
      name: "Premium Bottled Water",
      size: "500ml",
      price: "KSh 25",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCf01QbQ1tEaDHuBdCK-ZH589GY8CeCgvKaQ&s",
    },
    {
      name: "Premium Bottled Water",
      size: "1 Litre",
      price: "KSh 40",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCf01QbQ1tEaDHuBdCK-ZH589GY8CeCgvKaQ&s",
    },
    {
      name: "Premium Bottled Water",
      size: "20L Refill",
      price: "KSh 100",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCf01QbQ1tEaDHuBdCK-ZH589GY8CeCgvKaQ&s",
    },
  ];

  return (
    <div className="pt-16 transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      {/* ======================= HERO SECTION ======================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg"
          alt="water"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.55] dark:brightness-[0.35] transition-all duration-300"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent dark:from-black/70 dark:via-black/40 transition-all duration-300"></div>

        <div className="relative z-10 max-w-3xl text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-xl">
            Pure. Refreshing.
            <span className="block text-yellow-400">Lenana Drops</span>
          </h1>

          <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-gray-200">
            Delivering high-quality drinking water across Nanyuki.
            Affordable, pure, and produced under strict quality standards.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-8 px-10 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-lg transition flex items-center gap-2 mx-auto"
          >
            Login to Portal <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ======================= PRODUCTS SECTION ======================= */}
      <section className="py-20 px-6 transition-colors duration-300">
        <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-14">
          Our Products
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {products.map((p, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <img
                src={p.image}
                alt={p.name}
                className="h-56 w-full object-cover rounded-t-2xl"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {p.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{p.size}</p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">
                    {p.price}
                  </span>
                  <Droplets className="text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CTA BANNER ======================= */}
      <section className="py-20 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white text-center relative overflow-hidden transition-colors duration-300">
        <Droplets className="absolute top-5 left-10 opacity-20" size={80} />
        <Droplets className="absolute bottom-10 right-10 opacity-20" size={60} />

        <h2 className="text-4xl font-extrabold">Become a Distributor Today</h2>
        <p className="mt-3 text-white/90 max-w-xl mx-auto">
          Contact us and start selling Lenana Drops products with ease.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 px-10 py-3 bg-white text-yellow-700 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Login to Get Started
        </button>
      </section>
    </div>
  );
}

export default Home;
