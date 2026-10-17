import { NAV_ITEMS } from '@/lib/content';

export default function Footer() {
  return (
    <footer id="about" className="footer" aria-labelledby="about-title">
      <div className="wrap footer-grid">
        <div className="about">
          <h2 id="about-title" className="about-title">
            About NOESIS
          </h2>
          <p>
            <em>Noesis</em> is a Greek word for direct understanding — the act of the mind grasping itself. This
            project is an independent educational publication about psychology, emotion and consciousness, written to
            be read slowly.
          </p>
          <p className="fine">
            Everything here is for education and reflection. It is not medical or psychological advice and is not a
            substitute for professional care. If you are in distress or at risk of harm, please contact a qualified
            professional or your local emergency services.
          </p>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          <ul>
            {NAV_ITEMS.filter((n) => n.label !== 'About').map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="wrap footer-base">
        <span>© {new Date().getFullYear()} NOESIS</span>
        <span>Built with WebGL. Best experienced with sound off and attention on.</span>
      </div>
    </footer>
  );
}
