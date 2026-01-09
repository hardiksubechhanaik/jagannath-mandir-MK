import UPI from "../../assets/DonationQr.jpg"

const Payment = () => {
    return (
        <div className="flex justify-center py-10">
            <img src={UPI} alt="QR" className="w-80 h-80 object-contain"/>
        </div>
        
    )
}

export default Payment;