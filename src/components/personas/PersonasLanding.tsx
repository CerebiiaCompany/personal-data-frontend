import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import PersonasCtaBanner from "@/components/personas/PersonasCtaBanner";
import PersonasFaq from "@/components/personas/PersonasFaq";
import PersonasHero from "@/components/personas/PersonasHero";
import PersonasHowItWorks from "@/components/personas/PersonasHowItWorks";
import PersonasReveal from "@/components/personas/PersonasReveal";
import PersonasRightsSection from "@/components/personas/PersonasRightsSection";
import PersonasTipsSection from "@/components/personas/PersonasTipsSection";

const PersonasLanding = () => (
  <div className="flex flex-col">
    <PersonasHero />

    <PersonasReveal delay={0}>
      <PersonasHowItWorks />
    </PersonasReveal>

    <PersonasReveal delay={80}>
      <PersonasRightsSection />
    </PersonasReveal>

    <PersonasReveal delay={120}>
      <PersonasTipsSection />
    </PersonasReveal>

    <PersonasReveal delay={160}>
      <PersonasFaq />
    </PersonasReveal>

    <PersonasAnimateIn delay={200}>
      <PersonasCtaBanner />
    </PersonasAnimateIn>
  </div>
);

export default PersonasLanding;
