"use client";

import { useEffect, useState } from "react";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Popular", href: "#popular" },
  { label: "Reviews", href: "#reviews" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const localImages = {
  cheeseCorn: "/cheese-corn.jpg.jpeg",
  creamyChicken: "/creamy-chicken.jpg.jpeg",
  bbqClub: "/bbq-club.jpg.jpeg",
  friedMomos: "/fried-momos.jpg.jpeg",
  fries: "/French-Fries.jpg.jpeg",
  pizza: "/pizza.jpg.webp",
  pasta: "/Pasta.jpg.jpeg",
  burger: "/Burger.jpg.jpg",
  teaCoffee: "/Masala%20Chai%20%26%20Cold%20Coffee.jpg.jpeg",
};

const galleryImages = [
  "/From%20sizzling%20prep%20to%20happy%20bites(1).jpg.jpg",
  "/From%20sizzling%20prep%20to%20happy%20bites(2).jpg.jpg",
  "/From%20sizzling%20prep%20to%20happy%20bites(3).jpg.jpg",
  "/From%20sizzling%20prep%20to%20happy%20bites(4).jpg.jpg",
  "/From%20sizzling%20prep%20to%20happy%20bites(5).jpg.jpg",
  "/From%20sizzling%20prep%20to%20happy%20bites(6).jpg.jpg",
];

const menuSections = [
  {
    title: "Sandwiches",
    items: [
      {
        name: "Cheese & Corn Sandwich",
        price: "Rs.70",
        description: "Melty, creamy, and toasted for the ultimate quick craving.",
        image: localImages.cheeseCorn,
      },
      {
        name: "Creamy Chicken Sandwich",
        price: "Rs.90",
        description: "A local favorite with rich chicken filling and a satisfying street-style finish.",
        image: localImages.creamyChicken,
      },
    ],
  },
  {
    title: "Appetizers & Fried Bites",
    items: [
      {
        name: "Crispy Chicken Finger (6 pcs)",
        price: "Rs.119",
        description: "Verified from Swiggy listing as a crispy garlic-forward starter.",
        image: localImages.bbqClub,
      },
      {
        name: "Fried Momo Chicken (5 pcs)",
        price: "Rs.139",
        description: "Crunchy fried chicken momos with a savory center and snackable texture.",
        image: localImages.friedMomos,
      },
      {
        name: "BBQ Club Sandwich",
        price: "Rs.219",
        description: "Loaded, cheesy, and stacked, using your provided image in place of fried chicken wings.",
        image: localImages.bbqClub,
      },
    ],
  },
  {
    title: "Fries & Snacks",
    items: [
      {
        name: "French Fry Medium",
        price: "Rs.89",
        description: "Classic golden fries from the verified Swiggy appetizers menu.",
        image: localImages.fries,
      },
      {
        name: "French Fry Large",
        price: "Rs.129",
        description: "A bigger serving for sharing, evening hangouts, or bigger cravings.",
        image: localImages.fries,
      },
      {
        name: "Chilli Garlic French Fries",
        price: "Rs.129",
        description: "Spiced and garlicky fries listed publicly as a serves-for-two snack.",
        image: localImages.fries,
      },
    ],
  },
  {
    title: "Fast Food Favorites",
    items: [
      {
        name: "Pizza",
        price: "Approx. Rs.120",
        description: "Public reviews repeatedly call out the pizza as a standout item.",
        image: localImages.pizza,
      },
      {
        name: "Pasta",
        price: "Approx. Rs.110",
        description: "Comforting, filling, and positioned for bigger hunger moods.",
        image: localImages.pasta,
      },
      {
        name: "Burgers",
        price: "Approx. Rs.90",
        description: "Messy, satisfying burger-style fast food for the after-class rush.",
        image: localImages.burger,
      },
    ],
  },
  {
    title: "Drinks",
    items: [
      {
        name: "Masala Chai",
        price: "Approx. Rs.30",
        description: "A budget-friendly hot drink that fits the tea-focused listing profile.",
        image: localImages.teaCoffee,
      },
      {
        name: "Cold Coffee",
        price: "Approx. Rs.80",
        description: "A review-highlighted bestseller pairing with pizza and sandwiches.",
        image: localImages.teaCoffee,
      },
    ],
  },
];

const popularItems = [
  "Creamy Chicken Sandwich",
  "Fried Momos",
  "Pizza",
  "Chilli Garlic Fries",
  "Cold Coffee",
];

const reviewItems = [
  "Probably the best sandwich I had after a long time.",
  "Very affordable and delicious food.",
  "Pizza and cold coffee are amazing.",
  "Great taste and quantity.",
];

const localFeedbackKey = "unseen-local-feedback";
const localFallbackHosts = new Set(["localhost", "127.0.0.1"]);

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("");

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  async function handleFeedbackSubmit(event) {
    event.preventDefault();
    setFeedbackStatus("Sending feedback...");

    const formData = new FormData(event.currentTarget);
    const entry = {
      id: Date.now(),
      name: formData.get("name"),
      phone: formData.get("phone"),
      rating: formData.get("rating"),
      message: formData.get("message"),
      createdAt: new Date().toISOString(),
    };

    const saveLocally = () => {
      const existing = JSON.parse(window.localStorage.getItem(localFeedbackKey) || "[]");
      existing.unshift({ ...entry, localOnly: true });
      window.localStorage.setItem(localFeedbackKey, JSON.stringify(existing));
      event.currentTarget.reset();
      setFeedbackStatus("Backend unavailable. Open the site through http://localhost:3000 to save centrally. Saved locally on this device for now.");
    };

    const canUseLocalFallback =
      window.location.protocol === "file:" || localFallbackHosts.has(window.location.hostname);

    if (window.location.protocol === "file:") {
      saveLocally();
      return;
    }

    const payload = {
      name: entry.name,
      phone: entry.phone,
      rating: entry.rating,
      message: entry.message,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send feedback.");
      }

      event.currentTarget.reset();
      setFeedbackStatus("Thanks. Your feedback has been saved.");
    } catch (error) {
      if (canUseLocalFallback) {
        saveLocally();
        return;
      }

      setFeedbackStatus(error instanceof Error ? error.message : "Feedback service is unavailable right now.");
    }
  }

  return (
    <>
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="noise" />

      <header className="site-header">
        <nav className="navbar">
          <a className="brand" href="#hero" aria-label="Unseen Hunger home">
            <img className="brand-mark" src="/logo.jpg.jpeg" alt="Unseen Hunger logo" />
            <span className="brand-text">Unseen Hunger</span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="nav-links"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`} id="nav-links">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a className="button button-primary nav-cta" href="#order" onClick={() => setMobileMenuOpen(false)}>
              Order Now
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero section" id="hero">
          <div className="hero-copy reveal">
            <p className="eyebrow">Kolkata Street Food Startup</p>
            <h1>
              Feed Your Cravings
              <span>Discover the Taste of Unseen Hunger</span>
            </h1>
            <p className="hero-text">
              Affordable, delicious street food made fresh with bold flavors for students, young professionals,
              and street food lovers across Kolkata.
            </p>
            <div className="hero-actions">
              <a className="button button-secondary" href="#menu">
                View Menu
              </a>
              <a className="button button-primary" href="#order">
                Order Now
              </a>
            </div>
            <div className="hero-metrics">
              <div>
                <strong>4.8/5</strong>
                <span>200+ customer reviews</span>
              </div>
              <div>
                <strong>Rs.100-Rs.150</strong>
                <span>Average cost for two</span>
              </div>
              <div>
                <strong>Fresh Daily</strong>
                <span>Bold street food energy with startup polish</span>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal">
            <div className="hero-stack">
              <article className="hero-card hero-card-main floating-card">
                <img src={localImages.bbqClub} alt="Unseen Hunger signature sandwich" />
                <div className="hero-card-body">
                  <p>Real Brand Photo</p>
                  <strong>Street food, hot drinks, snacks, and fast bites from the Unseen Hunger listing gallery.</strong>
                </div>
              </article>
              <article className="hero-card hero-card-small card-top">
                <span className="tag">Best Seller</span>
                <strong>Creamy Chicken Sandwich</strong>
              </article>
              <article className="hero-card hero-card-small card-bottom">
                <span className="tag">Trending Combo</span>
                <strong>Pizza + Cold Coffee + Fries</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="about section" id="about">
          <div className="section-heading reveal">
            <p className="eyebrow">Our Story</p>
            <h2>Built in Sinthee for big flavor, fast service, and student-friendly value.</h2>
          </div>

          <div className="about-layout">
            <div className="about-panel reveal">
              <p>
                Unseen Hunger is a local food startup from Sinthee built around a simple idea: street food should feel
                exciting, fresh, generous, and affordable at the same time. The menu blends toasted sandwiches, fried
                bites, pizza, pasta, burgers, tea, and coffee into a youthful experience that feels perfect for evening
                hangouts, quick bites, and post-class cravings.
              </p>
              <p>
                The brand energy is modern and restless, but the food stays rooted in comfort, bold spice, and value
                for money. That combination is exactly why the reviews keep highlighting taste, quantity, and
                affordability.
              </p>
            </div>

            <div className="about-highlights reveal">
              <div className="mini-stat">
                <strong>Address</strong>
                <span>2N, KC Ghosh Road, Sinthee, Kolkata, West Bengal 700050, India</span>
              </div>
              <div className="mini-stat">
                <strong>Cuisine</strong>
                <span>Sandwiches, fast food, street food, tea, pizza, snacks, burgers, pasta</span>
              </div>
              <div className="mini-stat">
                <strong>Ordering</strong>
                <span>Call, WhatsApp, Swiggy, and Zomato for quick grab-and-go cravings</span>
              </div>
            </div>
          </div>
        </section>

        <section className="menu section" id="menu">
          <div className="section-heading reveal">
            <p className="eyebrow">Menu</p>
            <h2>Real brand photos with the dishes people actually talk about.</h2>
          </div>
          <div className="menu-sections">
            {menuSections.map((section) => (
              <div className="menu-section-block reveal" key={section.title}>
                <div className="menu-section-heading">
                  <p className="eyebrow">Menu Category</p>
                  <h3>{section.title}</h3>
                </div>
                <div className="menu-grid">
                  {section.items.map((item) => (
                    <article className="food-card" key={item.name}>
                      <img src={item.image} alt={item.name} />
                      <div className="food-card-content">
                        <div className="food-card-top">
                          <h3>{item.name}</h3>
                          <span>{item.price}</span>
                        </div>
                        <p>{item.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section explore-more">
          <div className="explore-panel reveal">
            <div>
              <p className="eyebrow">Explore More</p>
              <h2>See the full Unseen Hunger menu on Google.</h2>
              <p>
                Want more than the highlights? Open the public Google menu page to explore more items and menu details.
              </p>
            </div>
            <a
              className="button button-primary"
              href="https://www.google.com/search?client=ms-android-vivo-rvo3&hs=pVF&sca_esv=4b9c4fb793c57767&sxsrf=ANbL-n5VT3kMRz_n8bMPplnv889js5FRnw:1774393234638&q=unseen+hunger+menu&uds=ALYpb_kwIY7rxsmGqdv77ouA7fhRZTrmzNXxrq-wrc8cvSwusVzS8NF7yvbZqlUrvCuy9KIcMUGupTFImxE-qIkr54UEJ96V_YXdWgJO7WEXoVlCgyhNBjB9ohp6hRWXrvewuXlbCvFBAGStJkG3f29oibhbazMlqE2wZItaNIju6leQJyUzxJGstKa-AezA9_W4mJGsZKV_-sKPphkCMHTJZiEfnIxQAatJ4LK3R1S41C-_JqXZkpovxExpu5uXFKwrSPoOKzSo6IO2Z0FTO5wfYeeJ6rdHVoGuGBkOJNioovpqhhbEoWlKTmWcq4HsJUsBgj4aqKdoNbtLsQzeBJ1IcqA9vkk4R87cscCeCMAHeg8INq2V69Uc5BgCwcnjHPBf1sF2ceEitEtPSJW5Syix-DgmUvIpf0vvGlRYAWUjZcOSz4-B5T6i0-7FTfjDBCfvHgLj7wrhH5nMEBh_EArWh9RJxeWLr3qhmuneFAWzv1PHpuxLkZiXoaA-9RKqW3VmsGmhAozd&si=AL3DRZHjU-Z5tgRZewezbPACIFrENobBynmfODHWEfN9gcdx5hKxzj3HtAzOCb6Lvdn4osNHrByHZOCFNzVzwiG-dzGkZui1CByv8n-gYRGM7oCVECKJJ4qn0NnZQoZ9EgPquTOgicz-&sa=X&ved=2ahUKEwiN4cTz0bmTAxWdSWwGHehEIuoQk8gLegQIFxAB&ictx=1&biw=392&bih=745&dpr=2.75&stq=1&cs=0&lei=wBfDacvgLM-vwcsPkrjikAU#ebo=1&sbfbu=1&pi=unseen%20hunger%20menu"
              target="_blank"
              rel="noreferrer"
            >
              Explore More
            </a>
          </div>
        </section>

        <section className="popular section" id="popular">
          <div className="section-heading reveal">
            <p className="eyebrow">Popular Dishes</p>
            <h2>What the local buzz keeps pointing back to.</h2>
          </div>
          <div className="popular-grid">
            {popularItems.map((item, index) => (
              <article className="popular-card reveal" key={item}>
                <span className="chip">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item}</h3>
                <p>One of the standout items shaping the Unseen Hunger word-of-mouth reputation.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="reviews section" id="reviews">
          <div className="section-heading reveal">
            <p className="eyebrow">Customer Reviews</p>
            <h2>Real review style, strong social proof, and clear local momentum.</h2>
          </div>
          <div className="reviews-grid">
            {reviewItems.map((quote, index) => (
              <article className="review-card reveal" key={quote}>
                <div className="stars">Google Review - Highlight {index + 1}</div>
                <p>"{quote}"</p>
                <span>Based on publicly visible review summaries</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section reviews-more">
          <div className="explore-panel reveal">
            <div>
              <p className="eyebrow">Reviews On Google</p>
              <h2>See what people are saying on Google.</h2>
              <p>
                Explore more Google reviews and rating details for Unseen Hunger before your next order or visit.
              </p>
            </div>
            <div className="panel-actions">
              <a
                className="button button-primary"
                href="https://www.google.com/search?sca_esv=4b9c4fb793c57767&sxsrf=ANbL-n4Nf-1B57g6bqV9qM2l2chZojnVBA:1774394206032&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOcOKy9moRKzRDwBpbWLuhPr2ci9l4XKQ9oYLTbVxWixCtUGCTHKCcUm3GGYwDjJEVM-DjaCLKrIrskj1ebAlm-Y-6P-K&q=Unseen+Hunger+Reviews&sa=X&ved=2ahUKEwiShN7C1bmTAxXnaHADHTmgIcMQ0bkNegQIHhAF&biw=767&bih=695&dpr=1.25"
                target="_blank"
                rel="noreferrer"
              >
                Reviews On Google
              </a>
              <a
                className="button button-secondary"
                href="https://www.google.com/search?sca_esv=4b9c4fb793c57767&authuser=2&sxsrf=ANbL-n55GEK6BvnERgiep0QPU_ebL6R2og:1774397616350&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOcOKy9moRKzRDwBpbWLuhPr2ci9l4XKQ9oYLTbVxWixCtUGCTHKCcUm3GGYwDjJEVM-DjaCLKrIrskj1ebAlm-Y-6P-K&q=Unseen+Hunger+Reviews&sa=X&ved=2ahUKEwiuqPOc4rmTAxVUSGwGHUmoM-EQ0bkNegQINxAF&biw=770&bih=696&dpr=1.25#lrd=0x39f89d9b51447d35:0xd08842a1fa808951,3,,,,"
                target="_blank"
                rel="noreferrer"
              >
                Give Feedback
              </a>
            </div>
          </div>
        </section>

        <section className="gallery section" id="gallery">
          <div className="section-heading reveal">
            <p className="eyebrow">Gallery</p>
            <h2>Public listing photos that make the brand feel real and local.</h2>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <figure
                className={`gallery-item reveal ${index === 0 ? "tall" : ""} ${index === 3 ? "wide" : ""}`}
                key={image}
              >
                <img src={image} alt={`Unseen Hunger public brand image ${index + 1}`} />
              </figure>
            ))}
          </div>
        </section>

        <section className="order section" id="order">
          <div className="order-panel reveal">
            <div>
              <p className="eyebrow">Order Fast</p>
              <h2>Your next craving is one tap away.</h2>
              <p>Use the verified ordering profiles, call directly, or message on WhatsApp for pickup.</p>
            </div>
            <div className="order-actions">
              <a
                className="button order-swiggy"
                href="https://www.swiggy.com/restaurants/unseen-hunger-baranagar-dumdum-kolkata-873011"
                target="_blank"
                rel="noreferrer"
              >
                Swiggy
              </a>
              <a
                className="button order-zomato"
                href="https://www.zomato.com/kolkata/unseen-hunger-2-sinthi"
                target="_blank"
                rel="noreferrer"
              >
                Zomato
              </a>
              <a className="button button-secondary" href="tel:+917278550031">
                Call Now
              </a>
            </div>
          </div>
        </section>

        <section className="location section" id="location">
          <div className="section-heading reveal">
            <p className="eyebrow">Location</p>
            <h2>Find us in Sinthee, Kolkata.</h2>
          </div>
          <div className="location-layout">
            <div className="location-card reveal">
              <h3>Visit Unseen Hunger</h3>
              <p>2N, KC Ghosh Road, Sinthee, Kolkata, West Bengal 700050, India</p>
              <p>
                <a href="tel:+917278550031">+91 7278550031</a>
              </p>
              <p>Call to confirm today&apos;s opening hours and order availability.</p>
            </div>
            <div className="map-frame reveal">
              <iframe
                title="Unseen Hunger Location"
                src="https://www.google.com/maps?q=2N%2C%20KC%20Ghosh%20Road%2C%20Sinthee%2C%20Kolkata%2C%20West%20Bengal%20700050%2C%20India&z=15&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="contact section" id="contact">
          <div className="contact-grid">
            <div className="contact-copy reveal">
              <p className="eyebrow">Contact</p>
              <h2>Street food energy. Startup service. Fast ways to place an order.</h2>
              <p>
                Follow Unseen Hunger on Facebook for updates, brand posts, and more local food moments.
              </p>
            </div>
            <div className="contact-panel reveal">
              <a href="tel:+917278550031">Phone: +91 7278550031</a>
              <a href="https://www.facebook.com/unseenhunger1511/" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href="https://wa.me/917278550031" target="_blank" rel="noreferrer">
                WhatsApp Order
              </a>
            </div>
          </div>
        </section>

        <section className="section feedback-section" id="feedback">
          <div className="feedback-panel reveal">
            <div className="section-heading feedback-heading">
              <p className="eyebrow">Feedback</p>
              <h2>Share your experience with Unseen Hunger.</h2>
              <p>Leave a quick note, rating, and phone number if you want the team to follow up.</p>
            </div>
            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <input type="text" name="name" placeholder="Your name" required />
              <input type="tel" name="phone" placeholder="Phone number (optional)" />
              <fieldset className="rating-group">
                <legend>Select rating</legend>
                <div className="rating-options">
                  <label className="rating-option">
                    <input type="radio" name="rating" value="5" required />
                    <span>5 - Amazing</span>
                  </label>
                  <label className="rating-option">
                    <input type="radio" name="rating" value="4" required />
                    <span>4 - Great</span>
                  </label>
                  <label className="rating-option">
                    <input type="radio" name="rating" value="3" required />
                    <span>3 - Good</span>
                  </label>
                  <label className="rating-option">
                    <input type="radio" name="rating" value="2" required />
                    <span>2 - Needs work</span>
                  </label>
                  <label className="rating-option">
                    <input type="radio" name="rating" value="1" required />
                    <span>1 - Poor</span>
                  </label>
                </div>
              </fieldset>
              <textarea name="message" rows="5" placeholder="Tell us what you liked or what should improve" required />
              <button className="button button-primary" type="submit">
                Submit Feedback
              </button>
              <p className="feedback-status">{feedbackStatus}</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img className="brand-mark" src="/logo.jpg.jpeg" alt="Unseen Hunger logo" />
          <div>
            <strong>Unseen Hunger</strong>
            <p>Affordable, delicious street food made fresh with bold flavors.</p>
          </div>
        </div>
        <div className="footer-links">
          {navItems.slice(0, 4).map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <div className="footer-hours">
          <strong>Opening Hours</strong>
          <p>Call before visiting</p>
          <p>Hours vary across public listings</p>
        </div>
        <p className="footer-copy">
          Copyright 2026 Unseen Hunger. All rights reserved.
          <a className="admin-link" href="/admin">
            Owner Login
          </a>
        </p>
      </footer>

      <a className="whatsapp-float" href="https://wa.me/917278550031" target="_blank" rel="noreferrer" aria-label="Order on WhatsApp">
        <span>WA</span>
      </a>
    </>
  );
}
