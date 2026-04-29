const Footer = () => {
    return (
        <footer className="bg-orange-600 text-orange-50">
            {/*Top Section*/}
            <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-2">
                
                {/* Mandir Info */}
                <div>
                    <h3 className="text-xl font-semibold mb-3">
                        Shree Jagannath Mandir
                    </h3>
                    <p className="text-sm leading-relaxed text-orange-100">
                        A sacred place of devotion, peace, and spiritual energy.
                        Join us in daily aarti and divine celebrations.
                    </p>
                    <div className="p-1">
                        <h3 className="text-xl font-semibold mb-3">
                            Connect with us through</h3>
                        <p className="text-sm leading-relaxed text-orange-100"><b>Instagram :</b>@shree_jagannathmandir</p>
                        <p className="text-sm leading-relaxed text-orange-100"><b>FaceBook :</b>@Jagannath Mandir Maruti Kunj</p>
                        <p className="text-sm leading-relaxed text-orange-100"><b>Email :</b>Office@shreejagannathmandirmk.in</p>
                    </div>
                    
                </div>

                {/* Quick Links 
                <div>
                    <h3 className="text-xl font-semibold mb-3">
                        Quick Links
                    </h3>
                    <ul className="space-y-2 text-sm text-orange-100">
                        <li  className="hover:text-white cursor-pointer">Events</li>
                        <li  className="hover:text-white cursor-pointer">Gallery</li>
                        <li  className="hover:text-white cursor-pointer">Contact</li>
                    </ul>
                </div>*/}

                {/* Contact */}
                <div>
                    <h3 className="text-xl font-semibold mb-3">
                        Shree Jagannath Mandir, Maruti Kunj
                    </h3 >
                    <p className="text-sm text-orange-100">
                       📍 Maruti Kunj, Gurgaon, Haryana
                    </p>
                    <p className="text-sm text-orange-100 mt-2">
                        📞 +91 9717180859 
                    </p>
                </div>
            </div>
            {/*Bottom Bar*/}
            <div className="border-t border-orange-500 text-center py-4 text-sm text-orange-100">
                © {new Date().getFullYear()} Shri Jagannath Mandir Trust, Maruti Kunj. All rights reserved.
            </div>
        </footer>
    )
}

export default Footer;
