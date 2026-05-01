import Hero from "../components/home/Hero"
import MandirIntro from "../components/home/MandirIntro"
import AartiTimings from "../components/home/AartiTimings"
import UpcomingEvents from "../components/home/UpcomingEvents"
import Caution from "../components/caution/caution"

const Home = () => {
    return (
        <>
            <Caution />
            <Hero />
            <div className="relative pb-20">
                {/* Doodle background */}
                <div className="
    absolute inset-0
    bg-doodle
    bg-repeat
    bg-center
    opacity-15
    pointer-events-none
  "></div>

                {/* Content */}
                <div className="relative z-10">
                    <MandirIntro />
                    <AartiTimings />
                    <UpcomingEvents />
                </div>
            </div>

        </>
    )
}

export default Home;
