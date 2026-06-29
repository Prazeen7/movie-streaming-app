import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MovieSection from '../components/MovieSection';
import Loader from '../components/Loader';

const API_BASE_URL = 'https://movie-streaming-app-skxm.onrender.com/api';

const getGenreString = (genreIds) => {
    const genreMap = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
        14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
        9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
        53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    if (!genreIds || genreIds.length === 0) return 'Drama';
    return genreIds.slice(0, 2).map(id => genreMap[id] || '').filter(Boolean).join(' · ');
};

const getYear = (date) => {
    if (!date) return '2026';
    return date.split('-')[0] || '2026';
};

const ViewMore = () => {
    const location = useLocation();
    const movie = location.state?.movie;

    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [videoPlaying, setVideoPlaying] = useState(false);

    // TV series state
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Video backdrop
    const [trailerKey, setTrailerKey] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const [videoFailed, setVideoFailed] = useState(false);
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);
    const isMutedRef = useRef(true);
    const playTimeoutRef = useRef(null);

    const contentType = movie?.title ? 'movie' : movie?.name ? 'tv' : null;
    const isTv = contentType === 'tv';

    useEffect(() => {
        if (!movie || !contentType) {
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            setLoading(true);
            try {
                const castRes = await fetch(
                    `${API_BASE_URL}/content/${contentType}/${movie.id}/credits`
                );
                if (castRes.ok) {
                    const castData = await castRes.json();
                    setCast(castData.cast?.slice(0, 6) || []);
                }

                const recRes = await fetch(
                    `${API_BASE_URL}/content/${contentType}/${movie.id}/recommendations?page=1`
                );
                if (recRes.ok) {
                    const recData = await recRes.json();
                    setRecommendations((recData.results || []).slice(0, 18));
                }

                if (isTv) {
                    const tvRes = await fetch(
                        `${API_BASE_URL}/content/tv/${movie.id}`
                    );
                    if (tvRes.ok) {
                        const tvData = await tvRes.json();
                        const seasonList = (tvData.seasons || []).filter(s => s.season_number > 0);
                        setSeasons(seasonList);
                        if (seasonList.length > 0) {
                            setSelectedSeason(seasonList[0].season_number);
                        }
                    }
                }

                const videosRes = await fetch(
                    `${API_BASE_URL}/content/${contentType}/${movie.id}/videos`
                );
                if (videosRes.ok) {
                    const videosData = await videosRes.json();
                    const trailer = videosData.results?.find(
                        v => v.type === 'Trailer' && v.site === 'YouTube'
                    ) || videosData.results?.[0];
                    if (trailer) setTrailerKey(trailer.key);
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [movie, contentType, isTv]);

    useEffect(() => {
        if (!isTv || !movie || !selectedSeason) return;

        const fetchEpisodes = async () => {
            setLoadingEpisodes(true);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/content/tv/${movie.id}/season/${selectedSeason}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setEpisodes(data.episodes || []);
                } else {
                    setEpisodes([]);
                }
            } catch (error) {
                console.error('Error fetching episodes:', error);
                setEpisodes([]);
            } finally {
                setLoadingEpisodes(false);
            }
        };

        fetchEpisodes();
    }, [isTv, movie, selectedSeason]);

    useEffect(() => {
        if (!trailerKey) return;

        setVideoFailed(false);

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const handleFailure = () => {
            clearTimeout(playTimeoutRef.current);
            setVideoFailed(true);
            setVideoPlaying(false);
            if (playerRef.current?.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };

        const onReady = () => {
            if (!playerContainerRef.current) return;

            playTimeoutRef.current = setTimeout(() => {
                if (playerRef.current) {
                    const state = playerRef.current.getPlayerState?.();
                    if (state !== 1) handleFailure();
                }
            }, 6000);

            playerRef.current = new window.YT.Player(playerContainerRef.current, {
                videoId: trailerKey,
                playerVars: {
                    autoplay: 1,
                    mute: isMutedRef.current ? 1 : 0,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    enablejsapi: 1,
                    fs: 0,
                    disablekb: 1,
                    cc_load_policy: 0,
                    cc_lang_pref: 'none',
                    playsinline: 1,
                },
                events: {
                    onError: handleFailure,
                    onStateChange: (e) => {
                        if (e.data === 1) {               
                            clearTimeout(playTimeoutRef.current);
                            setVideoPlaying(true);           
                        }
                        if (e.data === 0) {               
                            if (playerRef.current) {
                                playerRef.current.seekTo(0);
                                playerRef.current.playVideo();
                            }
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            onReady();
        } else {
            window.onYouTubeIframeAPIReady = onReady;
        }

        return () => {
            clearTimeout(playTimeoutRef.current);
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [trailerKey]); 

    const toggleMute = useCallback(() => {
        if (!playerRef.current) return;
        if (playerRef.current.isMuted()) {
            playerRef.current.unMute();
            isMutedRef.current = false;
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            isMutedRef.current = true;
            setIsMuted(true);
        }
    }, []);

    // Handlers
    const handleSeasonChange = (seasonNumber) => {
        setSelectedSeason(seasonNumber);
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEpisodeClick = (episode) => {
        setSelectedMovie({
            ...episode,
            showId: movie.id,
            seasonNumber: selectedSeason,
            episodeNumber: episode.episode_number,
            title: `${movie.name} - S${String(selectedSeason).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')} - ${episode.name}`,
            isEpisode: true,
        });
    };

    const handlePlayTv = () => {
        if (seasons.length === 0) return;
        const firstSeason = seasons.reduce((a, b) => a.season_number < b.season_number ? a : b);
        if (firstSeason.episode_count > 0) {
            setSelectedMovie({
                isEpisode: true,
                showId: movie.id,
                seasonNumber: firstSeason.season_number,
                episodeNumber: 1,
                title: `${movie.name} - S${String(firstSeason.season_number).padStart(2, '0')}E01`,
            });
        } else {
            alert('No episodes available for this show.');
        }
    };

    // Styles
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100vh',
            background: '#0f0f1a',
            padding: 0,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            overflowX: 'hidden',
        },
        card: {
            maxWidth: '100%',
            width: '100%',
            background: 'transparent',
            borderRadius: 0,
            overflow: 'hidden',
            boxShadow: 'none',
        },
        backdropWrapper: {
            position: 'relative',
            width: '100%',
            height: '500px',
            overflow: 'hidden',
            background: '#0a0a10',
            marginTop: '0',
        },
        backdropImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 20%',
            opacity: 0.6,
        },
        backdropOverlay: {
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, #0f0f1a 0%, rgba(15,15,26,0.3) 25%, rgba(15,15,26,0.5) 60%, #0f0f1a 100%)',
            pointerEvents: 'none',
            zIndex: 2,
        },
        videoContainer: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '56.25vw',
            minHeight: '100%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1,
        },
        muteBtn: {
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            zIndex: 20,
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '1.2rem',
            transition: 'all 0.2s',
        },
        contentGrid: {
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: '32px',
            padding: '0 50px 40px 50px',
            marginTop: '-120px',
            position: 'relative',
            zIndex: 10,
        },
        posterWrapper: {
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            aspectRatio: '2 / 3',
            transition: 'transform 0.3s ease',
        },
        posterImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
        },
        infoPanel: {
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            textAlign: 'left',
            width: '100%',
        },
        title: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: '#fff',
            margin: 0,
        },
        meta: {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            color: '#b0b0c0',
        },
        rating: { 
            color: '#fbbf24', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.9rem',
        },
        genre: { color: '#a0a0b8', fontWeight: 500, fontSize: '0.9rem' },
        year: {
            background: '#2a2a3a',
            padding: '3px 12px',
            borderRadius: '16px',
            fontWeight: 500,
            color: '#d0d0e0',
            fontSize: '0.85rem',
        },
        overview: {
            color: '#c8c8d8',
            lineHeight: 1.6,
            fontSize: '0.9rem',
            maxWidth: '650px',
            margin: 0,
        },
        playBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#e50914',
            color: '#fff',
            border: 'none',
            padding: '11px 28px',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            width: 'fit-content',
            transition: 'all 0.2s ease',
            marginTop: '6px',
            boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
        },
        section: { 
            padding: '0 50px 40px 50px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '32px',
            maxWidth: '100%',
            overflow: 'hidden',
        },
        sectionTitle: {
            fontSize: '1.75rem',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#f0f0f8',
            textAlign: 'left',
        },
        castList: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
        },
        castItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#1a1a2e',
            padding: '12px',
            borderRadius: '12px',
            transition: 'all 0.2s',
            border: '1px solid rgba(255,255,255,0.05)',
        },
        castAvatar: {
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #3a3a50',
            flexShrink: 0,
        },
        castInfo: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            flex: 1,
            minWidth: 0,
        },
        castName: { 
            fontWeight: 600, 
            fontSize: '1rem', 
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
        },
        castCharacter: { 
            fontSize: '0.85rem', 
            color: '#9a9ab0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
        },
        seasonSection: {
            padding: '30px 50px 40px 50px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '100%',
            overflow: 'hidden',
            textAlign: 'left',
        },
        seasonHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '12px',
            marginBottom: '20px',
            textAlign: 'left',
        },
        seasonSelectWrap: { 
            position: 'relative', 
            minWidth: '120px',
            maxWidth: '140px',
        },
        customDropdown: {
            width: '100%',
            padding: '6px 24px 6px 10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
        },
        dropdownList: {
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            marginTop: '4px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        },
        dropdownOption: {
            padding: '10px 12px',
            fontSize: '0.85rem',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none',
        },
        seasonSelectArrow: {
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#fff',
            fontSize: '0.6rem',
            transition: 'transform 0.2s',
        },
        episodeListWrap: {
            maxHeight: '500px',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '6px',
            scrollbarWidth: 'thin',
        },
        episodeList: { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0',
            maxWidth: '100%',
        },
        episodeRow: {
            display: 'grid',
            gridTemplateColumns: '40px 120px 1fr',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'transparent',
            maxWidth: '100%',
            overflow: 'hidden',
            textAlign: 'left',
        },
        episodeNumber: {
            fontSize: '1rem',
            fontWeight: 600,
            color: '#b0b0c0',
            textAlign: 'center',
        },
        episodeThumb: {
            width: '100%',
            height: '68px',
            borderRadius: '4px',
            objectFit: 'cover',
            background: '#000',
            border: '1px solid rgba(255,255,255,0.08)',
        },
        episodeMeta: { 
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            minWidth: 0,
            overflow: 'hidden',
            textAlign: 'left',
        },
        episodeTitleRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            textAlign: 'left',
        },
        episodeTitle: {
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#fff',
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left',
        },
        episodeDur: { 
            fontSize: '0.75rem', 
            color: '#999',
            fontWeight: 400,
            whiteSpace: 'nowrap',
        },
        episodeDesc: {
            fontSize: '0.8rem',
            color: '#b0b0c0',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textAlign: 'left',
        },
        noEpisodes: { 
            color: '#666', 
            textAlign: 'center', 
            padding: '40px 0',
            fontSize: '0.95rem',
        },
    };

    if (loading) {
        return <Loader fullScreen transparent={false} />;
    }

    if (!movie) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#fff' }}>No content selected</p>
            </div>
        );
    }

    const title = movie.title || movie.name;
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
    const backdropPath = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
    const rating = movie.vote_average?.toFixed(1) || 'N/A';
    const year = getYear(movie.release_date || movie.first_air_date);
    const genres = getGenreString(movie.genre_ids);

    return (
        <div style={styles.container}>
            <style>
                {`
                    /* Scrollbar Styling */
                    .episode-list-wrap::-webkit-scrollbar {
                        width: 8px;
                    }
                    .episode-list-wrap::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.03);
                        border-radius: 4px;
                    }
                    .episode-list-wrap::-webkit-scrollbar-thumb {
                        background: rgba(229,9,20,0.4);
                        border-radius: 4px;
                        transition: background 0.2s;
                    }
                    .episode-list-wrap::-webkit-scrollbar-thumb:hover {
                        background: rgba(229,9,20,0.6);
                    }

                    /* Dropdown List Scrollbar */
                    .dropdown-list::-webkit-scrollbar {
                        width: 6px;
                    }
                    .dropdown-list::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.03);
                        border-radius: 3px;
                    }
                    .dropdown-list::-webkit-scrollbar-thumb {
                        background: rgba(229,9,20,0.4);
                        border-radius: 3px;
                    }
                    .dropdown-list::-webkit-scrollbar-thumb:hover {
                        background: rgba(229,9,20,0.6);
                    }

                    /* Cast Item Hover */
                    .cast-item:hover {
                        background: #2a2a3e;
                        transform: translateY(-2px);
                    }

                    /* Episode Row Hover */
                    .episode-row:hover {
                        background: rgba(229,9,20,0.08);
                    }

                    /* Tablet Responsive (max-width: 1024px) */
                    @media (max-width: 1024px) {
                        .responsive-grid {
                            grid-template-columns: 180px 1fr !important;
                            gap: 28px !important;
                            padding: 0 40px 36px !important;
                        }
                        .responsive-title {
                            font-size: 1.8rem !important;
                        }
                        .responsive-overview {
                            font-size: 0.85rem !important;
                        }
                        .responsive-backdrop {
                            height: 400px !important;
                        }
                        .responsive-section {
                            padding: 0 40px 36px !important;
                        }
                        .season-section {
                            padding: 32px 40px 40px !important;
                        }
                        .cast-list {
                            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
                        }
                    }

                    /* Mobile Landscape / Small Tablet (max-width: 820px) */
                    @media (max-width: 820px) {
                        .responsive-grid {
                            grid-template-columns: 1fr !important;
                            gap: 20px !important;
                            margin-top: -60px !important;
                            padding: 0 24px 32px !important;
                        }
                        .responsive-poster {
                            max-width: 160px !important;
                            margin: 0 auto !important;
                        }
                        .responsive-backdrop {
                            height: 300px !important;
                        }
                        .responsive-info {
                            align-items: center !important;
                            text-align: center !important;
                        }
                        .responsive-title {
                            font-size: 1.5rem !important;
                        }
                        .responsive-meta {
                            justify-content: center !important;
                            font-size: 0.85rem !important;
                        }
                        .responsive-overview {
                            max-width: 100% !important;
                            text-align: center !important;
                            font-size: 0.8rem !important;
                        }
                        .responsive-section {
                            padding: 0 24px 32px !important;
                        }
                        .season-section {
                            padding: 28px 24px 36px !important;
                        }
                        .cast-list {
                            grid-template-columns: 1fr !important;
                        }
                        .episode-row {
                            grid-template-columns: 40px 130px 1fr 30px !important;
                            gap: 12px !important;
                            padding: 14px 8px !important;
                        }
                        .episode-number {
                            font-size: 1rem !important;
                        }
                        .episode-thumb {
                            height: 72px !important;
                        }
                        .episode-title {
                            font-size: 0.85rem !important;
                        }
                        .episode-desc {
                            font-size: 0.8rem !important;
                        }
                        .search-wrap {
                            max-width: 100% !important;
                        }
                        .season-header {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                        }
                        .download-icon {
                            width: 28px !important;
                            height: 28px !important;
                            font-size: 0.9rem !important;
                        }
                    }

                    /* Mobile Portrait (max-width: 480px) */
                    @media (max-width: 480px) {
                        .responsive-grid {
                            padding: 0 16px 24px !important;
                            margin-top: -40px !important;
                            gap: 16px !important;
                        }
                        .responsive-poster {
                            max-width: 140px !important;
                        }
                        .responsive-backdrop {
                            height: 220px !important;
                        }
                        .responsive-title {
                            font-size: 1.3rem !important;
                        }
                        .responsive-overview {
                            font-size: 0.78rem !important;
                        }
                        .responsive-section {
                            padding: 0 16px 24px !important;
                        }
                        .season-section {
                            padding: 20px 16px 24px !important;
                        }
                        .section-title {
                            font-size: 1.3rem !important;
                        }
                        .episode-row {
                            grid-template-columns: 30px 100px 1fr !important;
                            padding: 10px 6px !important;
                            gap: 10px !important;
                        }
                        .episode-number {
                            font-size: 0.85rem !important;
                        }
                        .episode-thumb {
                            height: 56px !important;
                        }
                        .episode-title {
                            font-size: 0.75rem !important;
                        }
                        .episode-desc {
                            display: none !important;
                        }
                        .episode-dur {
                            font-size: 0.7rem !important;
                        }
                        .season-select {
                            font-size: 0.8rem !important;
                            padding: 5px 24px 5px 10px !important;
                        }
                        .episode-list-wrap {
                            max-height: 350px !important;
                        }
                    }

                    /* Small Mobile (max-width: 360px) */
                    @media (max-width: 360px) {
                        .responsive-title {
                            font-size: 1.4rem !important;
                        }
                        .episode-row {
                            grid-template-columns: 28px 90px 1fr !important;
                            padding: 8px 5px !important;
                            gap: 8px !important;
                        }
                        .episode-number {
                            font-size: 0.8rem !important;
                        }
                        .episode-thumb {
                            height: 50px !important;
                        }
                        .episode-title {
                            font-size: 0.7rem !important;
                        }
                        .season-select {
                            font-size: 0.75rem !important;
                        }
                        .episode-list-wrap {
                            max-height: 300px !important;
                        }
                    }
                `}
            </style>

            <div style={{ ...styles.card, overflow: 'visible' }}>
                {/* Backdrop with video or image */}
                <div style={styles.backdropWrapper} className="responsive-backdrop">
                    {trailerKey && !videoFailed ? (
                        <>
                            <div ref={playerContainerRef} style={styles.videoContainer} />
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 5, cursor: 'default',
                                pointerEvents: 'all',
                            }} />
                            {/* Left edge gradient */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, bottom: 0, width: '18%', zIndex: 6,
                                background: 'linear-gradient(to right, #0f0f1a 0%, rgba(15,15,26,0.6) 50%, transparent 100%)',
                                pointerEvents: 'none',
                            }} />
                            {/* Right edge gradient */}
                            <div style={{
                                position: 'absolute', top: 0, right: 0, bottom: 0, width: '18%', zIndex: 6,
                                background: 'linear-gradient(to left, #0f0f1a 0%, rgba(15,15,26,0.6) 50%, transparent 100%)',
                                pointerEvents: 'none',
                            }} />
                            <div style={styles.backdropOverlay} />
                            {/* Mute button — zIndex:20 beats the blocker at zIndex:5 */}
                            <button
                                style={styles.muteBtn}
                                className="mute-btn"
                                onClick={toggleMute}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <img src={backdropPath} alt={`${title} backdrop`} style={styles.backdropImg} />
                            <div style={styles.backdropOverlay} />
                        </>
                    )}
                </div>

                {/* Content Grid */}
                <div style={{ ...styles.contentGrid }} className="responsive-grid">
                    <div style={styles.posterWrapper} className="responsive-poster">
                        <img src={posterPath} alt={`${title} poster`} style={styles.posterImg} />
                    </div>

                    <div style={{ ...styles.infoPanel }} className="responsive-info">
                        <h1 style={styles.title} className="responsive-title">{title}</h1>
                        <div style={styles.meta} className="responsive-meta">
                            <span style={styles.rating}>⭐ {rating}</span>
                            <span style={styles.genre}>{genres}</span>
                            <span style={styles.year}>{year}</span>
                        </div>
                        <p style={{ ...styles.overview }} className="responsive-overview">
                            {movie.overview || 'No overview available.'}
                        </p>

                        <button
                            style={styles.playBtn}
                            className="play-btn"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ff0a1a';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#e50914';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            onClick={() => {
                                if (isTv) {
                                    handlePlayTv();
                                } else {
                                    setSelectedMovie({ ...movie, isEpisode: false });
                                }
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                            Play
                        </button>
                    </div>
                </div>

                {/* TV Season & Episodes */}
                {isTv && seasons.length > 0 && (
                    <div style={styles.seasonSection} className="season-section">
                        <div style={styles.seasonHeader}>
                            <div style={styles.seasonSelectWrap} className="season-select-wrap" ref={dropdownRef}>
                                <div 
                                    style={styles.customDropdown}
                                    onClick={toggleDropdown}
                                    className="custom-dropdown"
                                >
                                    <span>Season {selectedSeason}</span>
                                    <span style={{
                                        ...styles.seasonSelectArrow,
                                        position: 'relative',
                                        right: 'auto',
                                        top: 'auto',
                                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }}>
                                        ▼
                                    </span>
                                </div>
                                {dropdownOpen && (
                                    <div style={styles.dropdownList} className="dropdown-list">
                                        {seasons.map((s) => (
                                            <div
                                                key={s.season_number}
                                                style={styles.dropdownOption}
                                                className="dropdown-option"
                                                onClick={() => handleSeasonChange(s.season_number)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#e50914';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                Season {s.season_number}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {loadingEpisodes ? (
                            <Loader size="small" style={{ margin: '20px auto' }} />
                        ) : (
                            <div className="episode-list-wrap" style={styles.episodeListWrap}>
                                <div style={styles.episodeList}>
                                    {episodes.length > 0 ? (
                                        episodes.map((ep) => {
                                            const thumb = ep.still_path
                                                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                                                : movie.backdrop_path
                                                    ? `https://image.tmdb.org/t/p/w300${movie.backdrop_path}`
                                                    : 'https://via.placeholder.com/300x169/000/666?text=No+Image';
                                            return (
                                                <div
                                                    key={ep.id}
                                                    style={styles.episodeRow}
                                                    className="episode-row"
                                                    onClick={() => handleEpisodeClick(ep)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(229,9,20,0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <div style={styles.episodeNumber} className="episode-number">
                                                        {ep.episode_number}
                                                    </div>
                                                    <img
                                                        src={thumb}
                                                        alt={ep.name}
                                                        style={styles.episodeThumb}
                                                        className="episode-thumb"
                                                        loading="lazy"
                                                    />
                                                    <div style={styles.episodeMeta}>
                                                        <div style={styles.episodeTitleRow}>
                                                            <span style={styles.episodeTitle} className="episode-title">
                                                                {ep.name}
                                                            </span>
                                                            <span style={styles.episodeDur} className="episode-dur">
                                                                {ep.runtime ? `${ep.runtime}m` : ''}
                                                            </span>
                                                        </div>
                                                        <div style={styles.episodeDesc} className="episode-desc">
                                                            {ep.overview || 'No description available.'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={styles.noEpisodes}>No episodes found for this season.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Cast */}
                <div style={{ ...styles.section }} className="responsive-section">
                    <h2 style={styles.sectionTitle} className="section-title">Cast</h2>
                    <div style={{ ...styles.castList }} className="cast-list">
                        {cast.length > 0 ? (
                            cast.map((member) => (
                                <div key={member.id} style={styles.castItem} className="cast-item">
                                    <img
                                        src={member.profile_path ? `https://image.tmdb.org/t/p/w92${member.profile_path}` : 'https://via.placeholder.com/56/1a1a2e/666?text=?'}
                                        alt={member.name}
                                        style={styles.castAvatar}
                                    />
                                    <div style={styles.castInfo}>
                                        <span style={styles.castName}>{member.name}</span>
                                        <span style={styles.castCharacter}>{member.character || '—'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#666' }}>No cast information available.</p>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                <div style={{ ...styles.section }} className="responsive-section">
                    <h2 style={styles.sectionTitle} className="section-title">You may also like</h2>
                    {recommendations.length > 0 ? (
                        <MovieSection
                            title=""
                            movies={recommendations}
                            selectedMovie={selectedMovie}
                            setSelectedMovie={setSelectedMovie}
                            getProgress={() => 0}
                            displayMode="vertical"
                        />
                    ) : (
                        <p style={{ color: '#666' }}>No recommendations available.</p>
                    )}
                </div>
            </div>

            {/* Player Modal */}
            {selectedMovie && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => setSelectedMovie(null)}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '92%',
                            maxWidth: '1100px',
                            aspectRatio: '16/9',
                            background: '#000',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedMovie(null)}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '18px',
                                fontSize: '1.8rem',
                                background: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                zIndex: 10,
                                opacity: 0.8,
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.opacity = '1';
                                e.target.style.background = 'rgba(0,0,0,0.8)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.opacity = '0.8';
                                e.target.style.background = 'rgba(0,0,0,0.6)';
                            }}
                        >
                            ✕
                        </button>

                        {selectedMovie.isEpisode ? (
                            <iframe
                                src={`https://www.vidking.net/embed/tv/${selectedMovie.showId}/${selectedMovie.seasonNumber}/${selectedMovie.episodeNumber}?color=e50914&autoPlay=true`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allowFullScreen
                                title={selectedMovie.title}
                                style={{ border: 'none' }}
                                allow="autoplay; encrypted-media; fullscreen"
                            />
                        ) : (
                            <iframe
                                src={`https://www.vidking.net/embed/movie/${selectedMovie.id}?color=e50914&autoPlay=true`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allowFullScreen
                                title={selectedMovie.title || selectedMovie.name}
                                style={{ border: 'none' }}
                                allow="autoplay; encrypted-media; fullscreen"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewMore;