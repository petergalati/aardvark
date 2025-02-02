import React from "react";
import "./App.css";

function App() {
  const chromeExtensionUrl = "https://chrome.google.com/webstore/detail/your-extension-id";
  // Replace with your actual Chrome Web Store link

  return (
      <div className="App">
        {/* HEADER */}
        <header className="header">
          <nav className="navbar">
            <div className="logo">Aardvark</div>
            <ul className="nav-links">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-content">
            <h1>Aardvark: Fact-Check Your Data Instantly</h1>
            <p>
              Aardvark is a Chrome extension that automatically fact-checks data
              on the page you’re browsing. Get real-time insights, credible
              sources, and enhanced research—all in one click.
            </p>
            <a
                href={chromeExtensionUrl}
                className="cta-button"
                target="_blank"
                rel="noreferrer"
            >
              Add to Chrome
            </a>
          </div>
          <div className="hero-image">
            {/* Replace src with your own image */}
            <img src="/hero-image.png" alt="Extension Preview" />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features" id="features">
          <h2>Features</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>Real-Time Fact Checking</h3>
              <p>Automatically verify information as you browse.</p>
            </div>
            <div className="feature-item">
              <h3>Trusted Sources</h3>
              <p>Access a network of reputable sources and references.</p>
            </div>
            <div className="feature-item">
              <h3>Instant Insights</h3>
              <p>Get summarized insights and data-driven context at a glance.</p>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq" id="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>How does Aardvark work?</h3>
            <p>
              Aardvark scans the content of the page you're viewing and compares
              facts against our verified database. If a claim is questionable,
              we highlight it and provide credible sources.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is Aardvark free?</h3>
            <p>
              Yes! Aardvark is completely free to use. Simply install it from
              the Chrome Web Store and start browsing.
            </p>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact" id="contact">
          <h2>Contact Us</h2>
          <p>
            For support or feedback, email us at{" "}
            <a href="mailto:support@aardvark.com">support@aardvark.com</a>.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p>&copy; 2025 Aardvark. All rights reserved.</p>
        </footer>
      </div>
  );
}

export default App;
