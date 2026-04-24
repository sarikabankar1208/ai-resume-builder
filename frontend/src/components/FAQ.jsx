import "../styles/FAQ.css";
import { useState } from "react";

function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "Is this resume builder free?",
      a: "Yes, it is free for students and freshers."
    },
    {
      q: "What is AI resume builder?",
      a: "It uses AI to generate professional resume content."
    },
    {
      q: "Can I edit my resume later?",
      a: "Yes, you can edit anytime from dashboard."
    },
    {
      q: "Is my data secure?",
      a: "Yes, data is securely stored in Supabase."
    }
  ];

  return (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>

      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <h4 onClick={() => setOpen(open === index ? null : index)}>
            {faq.q}
          </h4>

          {open === index && <p>{faq.a}</p>}
        </div>
      ))}
    </div>
  );
}

export default FAQ;