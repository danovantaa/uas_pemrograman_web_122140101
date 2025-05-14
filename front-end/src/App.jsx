import MainLayout from "./components/main-layout";
import HeroSection from "./components/landing-page/hero";
import FeatureSection from "./components/landing-page/feature-section";
import HowItWorksSection from "./components/landing-page/how-it-works";
import TestimonialSection from "./components/landing-page/testimonial-section";
import CTASection from "./components/landing-page/cta-section";

function App() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <TestimonialSection />
      <CTASection />
    </MainLayout>
  );
}

export default App;
