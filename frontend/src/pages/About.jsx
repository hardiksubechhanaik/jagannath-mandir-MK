import { useEffect, useState } from "react";
import API from "@/config/api";

export default function About() {
  const [ content, setContent ] = useState(null);

  useEffect(() => {
    fetch(`${API}/about-page`)
    .then(res => res.json())
    .then(data => setContent(data))
    .catch(err => console.error("About page error:", err));
  }, []);

  if (!content) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="w-full">

      {/* PAGE TITLE */}
      <section className="bg-orange-50 py-12 text-center px-6">
        <h1 className="text-4xl font-bold text-orange-600">
          {content.pageTitle}
        </h1>
        <p className="text-gray-700 mt-2">
          {content.location}
        </p>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-12">

        {/* ABOUT MANDIR */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-orange-600 text-center">
            {content.aboutHeading}
          </h2>

          <p>
            {content.aboutParagraph1}
          </p>

          <p>
            {content.aboutParagraph2}
          </p>
        </div>

        {/* OUR PURPOSE */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-orange-600 text-center">
            {content.purposeHeading}
          </h2>

          <ul className="space-y-3 text-gray-700 max-w-2xl mx-auto">
            {content.purposes.map((item, index) => (
              <PurposeItem key={index} text={item}/>
            ))}
          </ul>
        </div>

        {/* SPIRITUAL MESSAGE */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            {content.messageHeading}
          </h2>

          <p className="text-gray-700 leading-relaxed">
            {content.messageText}
          </p>
        </div>

      </section>

    </div>
  )
}

function PurposeItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-orange-600 mt-1">🪔</span>
      <span>{text}</span>
    </li>
  )
}
