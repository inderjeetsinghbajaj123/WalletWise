import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Compass,
  CreditCard,
  LineChart,
  Sparkles,
  Target,
  Wallet,
  User,
  ArrowUpRight,
  PieChart,
} from "lucide-react";
import "./Homepage.css";

const Homepage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Animation for the connecting lines
  const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeInOut" },
    },
  };

  const animation = useMemo(
    () => ({
      fadeUp: {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      },
      stagger: {
        visible: { transition: { staggerChildren: 0.1 } },
      },
      popIn: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { type: "spring", stiffness: 100, delay: 0.2 },
        },
      },
    }),
    []
  );

  const smoothScroll = (targetId) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 90,
        behavior: "smooth",
      });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="ww-page">
      {/* Header */}
      <header className={`ww-header ${scrolled ? "scrolled" : ""}`}>
        <div className="ww-container ww-nav">
          <div className="ww-brand" onClick={() => smoothScroll("top")}>
            <div className="ww-logo-icon">
              <Wallet size={20} />
            </div>
            <span className="ww-logo-text">WalletWise</span>
          </div>

          <nav className={`ww-nav-links ${isMenuOpen ? "is-open" : ""}`}>
            <button onClick={() => smoothScroll("about")}>About</button>
            <button onClick={() => smoothScroll("features")}>Features</button>
            <button onClick={() => smoothScroll("how")}>How it Works</button>
            <button onClick={() => smoothScroll("testimonials")}>Stories</button>
          </nav>

          <div className="ww-nav-actions">
            <button className="ww-btn-link" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button
              className="ww-btn ww-btn-primary text-zinc-950 bg-black"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
            <button
              className="ww-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* --- HERO SECTION --- */}
        <section className="ww-hero-ref">
          <div className="ww-container ww-hero-ref-grid">
            {/* Left Content */}
            <motion.div
              className="ww-hero-ref-content"
              initial="hidden"
              animate="visible"
              variants={animation.stagger}
            >
              <motion.div className="ww-pill" variants={animation.fadeUp}>
                <Sparkles size={14} className="ww-pill-icon" />
                <span>Smart finance for students</span>
              </motion.div>

              <motion.h1 className="ww-hero-ref-title" variants={animation.fadeUp}>
                Make <span className="highlight-green">Planning</span> for <br />
                Student Life.
              </motion.h1>

              <motion.p className="ww-hero-ref-sub" variants={animation.fadeUp}>
                WalletWise gives you a real-time view of your budgets, expenses,
                and goals in one calming space designed for college life. Stop
                guessing, start tracking.
              </motion.p>

              <motion.div className="ww-hero-ref-actions" variants={animation.fadeUp}>
                <button
                  className="ww-btn ww-btn-primary ww-btn-lg"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
                <button
                  className="ww-btn-link ww-btn-lg"
                  onClick={() => smoothScroll("features")}
                >
                  Explore Features <ChevronRight size={16} />
                </button>
              </motion.div>

              {/* Total Members Section */}
              <motion.div className="ww-hero-ref-members" variants={animation.fadeUp}>
                <p className="ww-members-label">Total Members</p>
                <div className="ww-members-row">
                  <div className="ww-avatar-stack">
                    <img src="https://i.pravatar.cc/100?img=33" alt="User" />
                    <img src="https://i.pravatar.cc/100?img=47" alt="User" />
                    <img src="https://i.pravatar.cc/100?img=12" alt="User" />
                  </div>
                  <span className="ww-member-count">1.5K</span>
                </div>

                <svg className="ww-wavy-line" viewBox="0 0 300 100" fill="none">
                  <path
                    d="M10 80 C 60 80, 80 20, 150 20 C 220 20, 240 80, 290 80"
                    stroke="#FB923C" strokeWidth="3" strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              className="ww-hero-ref-visual"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="ww-dashboard-mock">
                <div className="ww-mock-header">
                  <div>
                    <p className="text-black">WalletWise Overview</p>
                    <p className="ww-mock-sub">Week 4 • Campus term</p>
                  </div>
                  <div className="ww-mock-content">
                    <div className="ww-mock-grid">
                      <div className="ww-mock-cell">
                        <div className="ww-mock-icon"><Wallet size={24} /></div>
                        <div className="ww-mock-label">Budget</div>
                      </div>
                      <div className="ww-mock-cell">
                        <div className="ww-mock-icon"><BarChart3 size={24} /></div>
                        <div className="ww-mock-label">Expenses</div>
                      </div>
                      <div className="ww-mock-cell">
                        <div className="ww-mock-icon"><Target size={24} /></div>
                        <div className="ww-mock-label">Goals</div>
                      </div>
                      <div className="ww-mock-cell">
                        <div className="ww-mock-icon"><LineChart size={24} /></div>
                        <div className="ww-mock-label">Reports</div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="ww-float-card icon-card"
                  variants={animation.popIn}
                  initial="hidden"
                  animate="visible"
                >
                  <Briefcase size={24} color="#FB923C" />
                </motion.div>

                <motion.div
                  className="ww-float-card graph-card"
                  variants={animation.popIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <div className="ww-graph-header">
                    <span>This Week <span className="green-text">75% +</span></span>
                  </div>
                  <div className="ww-graph-amount">$954</div>
                  <div className="ww-mini-wave">
                    <svg viewBox="0 0 100 30" fill="none">
                      <path d="M0 25 C 10 25, 10 10, 20 10 C 30 10, 30 20, 40 20 C 50 20, 50 5, 60 5 C 70 5, 70 25, 80 25 L 100 15" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </motion.div>

                <div className="ww-dot dot-orange"></div>
                <div className="ww-dot dot-green"></div>
                <div className="ww-dot dot-blue"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="ww-section" id="about">
          <div className="ww-container">
            <div className="ww-text-block">
              <p className="ww-kicker">About WalletWise</p>
              <h2>Smart student finance tracking that <br /> explains the “why.”</h2>
              <p className="ww-desc-lg">
                WalletWise is an intelligent personal finance platform built for
                students and young professionals to not just track money, but
                understand and improve financial behavior.
              </p>
            </div>
          </div>
        </section>

        {/* --- PROBLEM SECTION (CONNECTED NODES) --- */}
        <section className="ww-section ww-bg-subtle" id="problem">
          <div className="ww-container ww-grid-2">
            <div className="ww-content-left">
              <p className="ww-kicker">Why students struggle</p>
              <h2>Why money feels stressful in college</h2>
              <p className="ww-desc">
                Juggling bills, budgets, and savings shouldn’t be another source of
                stress.
              </p>
              <ul className="ww-check-list">
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <span><strong>Too many accounts:</strong> Your money is scattered across banks, apps, and loans.</span>
                </li>
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <span><strong>Restrictive budgeting:</strong> Most tools aren't built for irregular student income.</span>
                </li>
                <li>
                  <CheckCircle2 size={20} className="check-icon" />
                  <span><strong>Anxiety about the future:</strong> "Can I afford this?" shouldn't be a daily worry.</span>
                </li>
              </ul>
            </div>

            <div className="ww-content-right">
              <div className="ww-visual-connected">
                <svg className="ww-connect-lines" viewBox="0 0 500 400">
                  <motion.path d="M 250 200 C 250 150, 120 180, 100 100" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" variants={drawLine} initial="hidden" whileInView="visible" viewport={{ once: true }} />
                  <motion.path d="M 250 200 C 300 200, 350 220, 400 150" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" variants={drawLine} initial="hidden" whileInView="visible" viewport={{ once: true }} />
                  <motion.path d="M 250 200 C 250 250, 220 300, 200 340" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" variants={drawLine} initial="hidden" whileInView="visible" viewport={{ once: true }} />
                </svg>

                <motion.div
                  className="ww-center-node"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="ww-center-icon"><User size={24} color="white" /></div>
                  <div className="ww-center-pulse"></div>
                </motion.div>

                <motion.div className="ww-conn-card card-tuition" animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="icon-box ib-blue"><CreditCard size={18} /></div><span>Tuition</span>
                </motion.div>
                <motion.div className="ww-conn-card card-rent" animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                  <div className="icon-box ib-green"><Wallet size={18} /></div><span>Rent Split</span>
                </motion.div>
                <motion.div className="ww-conn-card card-break" animate={{ y: [-5, 5, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                  <div className="icon-box ib-orange"><Target size={18} /></div><span>Spring Break</span>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* --- IMPROVED FEATURES SECTION (BENTO GRID) --- */}
        <section className="ww-section" id="features">
          <div className="ww-container">
            <div className="ww-section-header centered">
              <p className="ww-kicker">Core Features</p>
              <h2>Everything you need to stay ahead.</h2>
              <p>Smart automation and dashboards that turn anxiety into confidence.</p>
            </div>

            <motion.div
              className="ww-bento-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={animation.stagger}
            >
              {[
                {
                  className: "span-2",
                  icon: <Compass size={24} />,
                  title: "Flexible Budgeting",
                  text: "Plan tuition, rent, and daily spending with flexible lanes designed for student life.",
                  visual: (
                    <div className="ww-bento-visual">
                      <div className="bar-group">
                        <div className="bar-bg"><div className="bar-fill w-75"></div></div>
                        <div className="bar-bg"><div className="bar-fill w-40"></div></div>
                        <div className="bar-bg"><div className="bar-fill w-60"></div></div>
                      </div>
                    </div>
                  )
                },
                {
                  className: "",
                  icon: <CreditCard size={24} />,
                  title: "Expense Tracking",
                  text: "Log every swipe in seconds with auto-categories."
                },
                {
                  className: "",
                  icon: <Target size={24} />,
                  title: "Smart Goals",
                  text: "Set savings goals and track progress visually."
                },
                {
                  className: "span-2",
                  icon: <BarChart3 size={24} />,
                  title: "Visual Reports",
                  text: "Generate weekly insights that explain exactly where your money goes.",
                  visual: (
                    <div className="ww-bento-visual">
                      <div className="chart-row">
                        <div className="chart-col h-40"></div>
                        <div className="chart-col h-60"></div>
                        <div className="chart-col h-80 active"></div>
                        <div className="chart-col h-50"></div>
                      </div>
                    </div>
                  )
                },
                {
                  className: "",
                  icon: <LineChart size={24} />,
                  title: "Predictive Planning",
                  text: "Forecast upcoming expenses and prepare for bills."
                },
                {
                  className: "",
                  icon: <Brain size={24} />,
                  title: "Behavior Analysis",
                  text: "Detect overspending patterns and build habits."
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={`ww-bento-card ${item.className}`}
                  variants={animation.fadeUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="ww-bento-content">
                    <div className="ww-card-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    {item.className === "span-2" && (
                      <div className="ww-bento-link">
                        Learn more <ArrowUpRight size={16} />
                      </div>
                    )}
                  </div>
                  {/* Render Visual for large cards */}
                  {item.visual && item.visual}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="ww-section ww-bg-subtle" id="how">
          <div className="ww-container">
            <div className="ww-section-header centered">
              <p className="ww-kicker">How it works</p>
              <h2>From first login to real savings.</h2>
            </div>
            <div className="ww-steps-row">
              {[
                { title: "Set up your dashboard", text: "Add income, tuition, and recurring expenses to build your baseline." },
                { title: "Track and categorize", text: "Log spending or import transactions to keep your categories accurate." },
                { title: "Review insights weekly", text: "See your savings, adjust budgets, and stay on top of your goals." },
              ].map((step, index) => (
                <div className="ww-step-col" key={index}>
                  <div className="ww-step-num">0{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="ww-section" id="testimonials">
          <div className="ww-container">
            <div className="ww-section-header">
              <h2>Student Voices</h2>
            </div>
            <motion.div
              className="ww-testimonial-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={animation.stagger}
            >
              {[
                { name: "Maya Chen", role: "Biology Major", quote: "The weekly snapshot keeps me calm. I finally know what I can spend without guilt." },
                { name: "Jordan Reyes", role: "Design Student", quote: "WalletWise feels like a coach. It nudges me before I overspend and celebrates wins." },
                { name: "Samir Patel", role: "CS Student", quote: "I love the goals view. Watching my savings climb keeps me motivated every week." },
              ].map((t, i) => (
                <motion.div key={i} className="ww-testimonial-card" variants={animation.fadeUp}>
                  <div className="ww-quote-mark">“</div>
                  <p className="ww-quote-text">{t.quote}</p>
                  <div className="ww-user-meta">
                    <div className="ww-user-avatar-placeholder">{t.name[0]}</div>
                    <div><h4>{t.name}</h4><span>{t.role}</span></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="ww-section ww-cta-section">
          <div className="ww-cta-box">
            <h2>Launch your WalletWise plan in under five minutes.</h2>
            <p>Set budgets, track spending, and hit your goals with a dashboard designed for real student routines.</p>
            <button className="ww-btn ww-btn-white" onClick={() => navigate("/signup")}>Get Started Free</button>
          </div>
        </section>
      </main>

      <footer className="ww-footer">
        <div className="ww-container">
          <div className="ww-footer-content">
            <div className="ww-brand-footer"><Wallet size={18} /> WalletWise</div>
            <div className="ww-footer-links">
              <a href="#about">About</a><a href="#features">Features</a><a href="#testimonials">Stories</a>
            </div>
            <div className="ww-copy"><p>Made with ❤️ in India</p><p className="copy-year">© 2026 WalletWise.</p></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;