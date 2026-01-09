const MandirInfo = () => {
    return (
        <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-orange-600">
                    Shree Jagannath Mandir Trust
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                    Shri Jagannath Mandir, 
                    Maruti Kunj,<br/>
                    Gurgaon, Haryana – 122102
                    </p>
                    <p className="text-gray-700">
                    Pedestrian Entry/Vehicle Entry: Jagannath Mandir Entry Gate – 1 
                    </p>
                    <div className="text-gray-700">
                    <p>📞 +91 9876543210</p>
                    <p>📧 info@yourmandir.com</p>
                    </div>
                </div>
                
                <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-sm">
                    <iframe  
                        title="Mandir Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3511.03961587107!2d77.07438677211296!3d28.357651875815897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d23001c33392f%3A0x20c9d28006b2c6a8!2sShree%20Jagannath%20Mandir%2C%20Maruti%20Kunj!5e0!3m2!1sen!2sin!4v1767442806385!5m2!1sen!2sin" 
                        width="600" 
                        height="450" 
                        style={{border:0}}
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade"/>
                </div>
            </div>
        </section>
        
    )
}

export default MandirInfo;