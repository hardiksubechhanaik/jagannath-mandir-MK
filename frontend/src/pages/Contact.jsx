import ContactUsForm from "../components/contact/ContactForm";
import ContactTitle from "../components/contact/ContactTitle";
import MandirInfo from "../components/contact/MandirInfo";
import Caution from "../components/caution/caution";

const Contact = () => {
    return(
        <>
            <Caution/>
            <ContactTitle/>
            <MandirInfo/>
            <ContactUsForm/>
        </>
    )
}

export default Contact;
