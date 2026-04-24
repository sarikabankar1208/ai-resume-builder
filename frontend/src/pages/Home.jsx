import "../styles/Home.css";
import Hero from "../components/Hero";
import Steps from "../components/Steps";
import Features from "../components/Features1";
import Feedback from "../components/Feedback1";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Hero />
      <Steps />
      <Features />
      <Feedback />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;