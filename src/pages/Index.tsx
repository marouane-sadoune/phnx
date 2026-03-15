import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import { FeaturedDrop } from "@/components/FeaturedDrop";
import { FAQSection } from "@/components/FAQSection";
import { CustomerReviews } from "@/components/CustomerReviews";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturedDrop />
        <ProductGrid />
        <FAQSection />
        <CustomerReviews />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
