import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Security from "@/components/landing/Security";
import Integrations from "@/components/landing/Integrations";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <Security />
      <Integrations />
      <Footer />
    </div>
  );
};

export default Index;
