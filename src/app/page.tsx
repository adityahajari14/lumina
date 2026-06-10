import Hero from "../components/home/Hero";
import ValueProps from "../components/home/ValueProps";
import OurStory from "../components/home/OurStory";
import MeasuringGuide from "../components/home/MeasuringGuide";
import Installation from "../components/home/Installation";
import Reviews from "../components/home/Reviews";
import Faq from "../components/home/Faq";
import SubscribeOffer from "../components/home/SubscribeOffer";
import EmailCaptureModal from "../components/home/EmailCaptureModal";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <EmailCaptureModal />
      <Hero />
      <ValueProps />
      <OurStory />
      <MeasuringGuide />
      <Installation />
      <Reviews />
      <SubscribeOffer />
      <Faq />
    </div>
  );
}
