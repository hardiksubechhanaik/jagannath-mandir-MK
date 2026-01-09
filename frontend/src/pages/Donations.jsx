import DonationAmounts from "../components/donationPage/DonationAmountTiles"
import DonorDetails from "../components/donationPage/DonorDetailsForm";
import Hero from "../components/donationPage/Hero"
import TrustInfo from "../components/donationPage/TrustInfo";
import Payment from "../components/donationPage/UpiImage";

const Donation = () => {
    return (
        <>
        <Hero/>
        <DonationAmounts/>
        <Payment/>
        <DonorDetails/>
        <TrustInfo/>
        </>
    )
}

export default Donation;