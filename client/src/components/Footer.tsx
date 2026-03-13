import './Style/Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-divider"></div>
      <div className="footer-container">
        <div className="footer-column">
          <h3>Cric.It</h3>
          <p>Live cricket scoring platform</p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <a href="/team">Teams</a>
          <a href="/player">Players</a>
          <a href="/match">Matches</a>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>© 2026 Cric.It</p>
          <p>All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;