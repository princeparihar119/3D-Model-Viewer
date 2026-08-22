import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h5>3D Model Viewer</h5>

            <p>Upload, view and manage your 3D models easily.</p>
          </div>

          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              © {new Date().getFullYear()} 3D Model Viewer. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
