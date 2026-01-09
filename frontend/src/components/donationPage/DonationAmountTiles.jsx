import { useEffect, useState } from "react";
import Tile from "../common/Tiles";
import API from "../../../config/api";

const DonationAmounts = ({ onSelectAmount }) => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/donation-page`)
      .then((res) => res.json())
      .then((data) => {
        setPageData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Donation page error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-gray-400">Loading donation options...</p>
      </section>
    );
  }

  if (!pageData) return null;

  return (
    <section className="py-16 px-6">
      {/* TITLE */}
      <h2 className="text-3xl font-bold text-center mb-4">
        Choose a Donation Amount
      </h2>

      {/* NOTE */}
      <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
        {pageData.note}
      </p>

      {/* DONATION AMOUNTS */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {pageData.amounts.map((item, index) => (
          <div
            key={index}
            onClick={() => onSelectAmount?.(item.amount)}
            className="cursor-pointer"
          >
            <Tile
              title={`₹${item.amount}`}
              description={item.label}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonationAmounts;
