const Footer = ({ language = "en" }) => {
    const translations = {
        en: {
            brandName: "EC Portal Nepal",
            description: "Secure and transparent digital voting infrastructure.",
            copyright: "© 2082 Election Commission Nepal"
        },
        ne: {
            brandName: "ईसी पोर्टल नेपाल",
            description: "सुरक्षित र पारदर्शी डिजिटल मतदान अवसंरचना।",
            copyright: "© २०८२ निर्वाचन आयोग नेपाल"
        }
    };

    const t = translations[language] || translations.en;

    return (
        <footer className="footer-modern mt-auto bg-white py-4">
            <div className="container px-4 text-center">
                <div className="row g-4 align-items-center">
                    <div className="col-lg-4 text-lg-start">
                        <h5 className="fw-bold text-app-dark mb-2">{t.brandName}</h5>
                        <p className="text-app-muted small mb-0">{t.description}</p>
                    </div>
                    <div className="col-lg-4">
                        <div className="d-flex justify-content-center gap-3 mb-3">
                            <i className="bi bi-facebook fs-5 text-app-muted"></i>
                            <i className="bi bi-twitter-x fs-5 text-app-muted"></i>
                            <i className="bi bi-globe fs-5 text-app-muted"></i>
                        </div>
                        <div className="small text-app-muted">{t.copyright}</div>
                    </div>
                    <div className="col-lg-4 text-lg-end">
                        <div>
                            <img src="nepal.png" alt="Nepal" className="img-fluid" width='100px' height='100px' />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
