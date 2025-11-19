import React from "react";
import { Droplets, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const products = [
    {
      name: "Premium Bottled Water",
      size: "500ml",
      price: "KSh 25",
      image:
        "https://images.unsplash.com/photo-1612198796135-896f23b7d5fd?auto=format&fit=crop&w=500&q=60",
    },
    {
      name: "Premium Bottled Water",
      size: "1 Litre",
      price: "KSh 40",
      image:
        "https://images.unsplash.com/photo-1598509839151-2e74c4b31c56?auto=format&fit=crop&w=500&q=60",
    },
    {
      name: "Premium Bottled Water",
      size: "20L Refill",
      price: "KSh 100",
      image:
        "https://images.unsplash.com/photo-1589365278144-c9c4897b2f09?auto=format&fit=crop&w=500&q=60",
    },
  ];

  return (
    <div className="pt-20">
      {/* HERO SECTION */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white leading-tight">
          Pure. Refreshing.  
          <span className="text-green-600 dark:text-green-400"> Lenana Drops</span>
        </h1>

        <p className="max-w-2xl mt-4 text-lg text-gray-600 dark:text-gray-300">
          Delivering high-quality drinking water across Nanyuki. Affordable, pure,
          and produced under strict quality standards.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-8 px-8 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2"
        >
          Login to Portal <ArrowRight size={18} />
        </button>
      </section>

      {/* PRODUCT SECTION */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900 transition-all">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">
          Our Products
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((p, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img src={p.image} alt="" className="h-48 w-full object-cover" />

              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {p.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-300">{p.size}</p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-green-600 font-bold">{p.price}</span>
                  <Droplets className="text-green-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold">Become a distributor today</h2>
        <p className="mt-2 text-white/90">
          Contact us and start selling Lenana Drops products.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-5 px-8 py-3 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Login to Get Started
        </button>
      </section>
    </div>
  );
}

export default Home;
