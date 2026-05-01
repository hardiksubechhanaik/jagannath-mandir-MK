import DonationAmounts from "../components/donationPage/DonationAmountTiles"
import DonorDetails from "../components/donationPage/DonorDetailsForm";
import Hero from "../components/donationPage/Hero"
import TrustInfo from "../components/donationPage/TrustInfo";
import Payment from "../components/donationPage/UpiImage";
import Caution from "../components/caution/caution";

const Donation = () => {
    return (
        <>
        <Caution/>
        <Hero/>
        <DonationAmounts/>
        <Payment/>
        <DonorDetails/>
        <TrustInfo/>
        </>
    )
}

export default Donation;
