import React, { useState } from 'react';
import TMDB from '../assets/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg';
import footerLogo from '../assets/footerLogo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [hoveredLink, setHoveredLink] = useState(null);

    const styles = {
        footer: {
            backgroundColor: '#0f0f1a',
            color: '#e0e0e0',
            padding: '3rem 2rem 1rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
            borderTop: '2px solid rgba(229, 9, 20, 0.3)',
            marginTop: '2rem',
        },
        footerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 1fr',
            gap: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
        // Left Column
        footerBrand: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        },
        brandLogo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        brandDescription: {
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#888',
            maxWidth: '320px',
            margin: '0',
        },
        // Right Column - Credits & Attribution (with TMDB logo)
        footerCreditsRight: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            textAlign: 'right',
            gap: '0.25rem',
        },
        creditsHeading: {
            color: '#888',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 0.2rem 0',
            fontWeight: '600',
        },
        tmdbLogoCredits: {
            height: '28px',
            width: 'auto',
            objectFit: 'contain',
            opacity: '0.7',
            marginBottom: '0.1rem',
        },
        attributionNote: {
            fontSize: '0.7rem',
            color: '#666',
            maxWidth: '260px',
            lineHeight: '1.4',
            margin: '0',
        },
        // Bottom Bar
        footerBottom: {
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
        },
        copyright: {
            fontSize: '0.85rem',
            color: '#666',
            margin: '0',
            textAlign: 'center',
            flex: 1, // Keeps copyright perfectly centered
        },
    };

    const getFooterLogoStyle = () => ({
        height: '65px',
        width: 'auto',
        objectFit: 'contain',
        transition: 'opacity 0.2s ease',
    });

    return (
        <footer style={styles.footer}>
            <style>{`
                @media (max-width: 992px) {
                    .footer-content {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 2rem !important;
                    }
                    .footer-credits-right {
                        align-items: flex-start !important;
                        text-align: left !important;
                    }
                }
                @media (max-width: 640px) {
                    .footer {
                        padding: 2rem 1rem 1rem !important;
                    }
                    .footer-content {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                    .footer-bottom {
                        flex-direction: column !important;
                        text-align: center !important;
                        gap: 0.5rem !important;
                    }
                    .brand-description {
                        max-width: 100% !important;
                    }
                    .footer-credits-right {
                        align-items: center !important;
                        text-align: center !important;
                    }
                }
            `}</style>

            <div className="footer-content" style={styles.footerContent}>
                {/* Left Section - Logo & Description */}
                <div style={styles.footerBrand}>
                    <div style={styles.brandLogo}>
                        <img src={footerLogo} style={getFooterLogoStyle()} alt="MovieDash Logo" />
                    </div>
                    <p className="brand-description" style={styles.brandDescription}>
                        MovieDash is your ultimate destination for discovering movies,
                        tracking what's trending, and exploring the world of cinema.
                    </p>
                </div>

                {/* Middle Section - Empty */}
                <div></div>

                {/* Right Section - Credits & Attribution with TMDB Logo */}
                <div className="footer-credits-right" style={styles.footerCreditsRight}>
                    <h4 style={styles.creditsHeading}>Credits & Attribution</h4>
                    <a
                        href="https://www.themoviedb.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src={TMDB}
                            alt="TMDB Logo"
                            style={styles.tmdbLogoCredits}
                            onMouseEnter={() => setHoveredLink('tmdb-credits')}
                            onMouseLeave={() => setHoveredLink(null)}
                        />
                    </a>
                    <p style={styles.attributionNote}>
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>
                </div>
            </div>

            {/* Bottom Bar - Logo left, Copyright center */}
            <div className="footer-bottom" style={styles.footerBottom}>

                {/* Center - Copyright */}
                <p style={styles.copyright}>
                    &copy; {currentYear} MovieDash. All rights reserved.
                </p>

                {/* Right - Intentionally empty to keep copyright centered */}
            </div>
        </footer>
    );
};

export default Footer;