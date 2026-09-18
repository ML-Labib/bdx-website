import React, { useState, useMemo, useRef } from 'react';
import { DataTable } from '../../components/DataTable.jsx';
import { StatsCard } from './StatsCard.jsx';
import './statsTab.css';

// --- MOCK DATA ---
const MOCK_TEAMS_DATA = [
    { rank: 1, teamId: { name: 'Virtus.pro', logo: 'https://via.placeholder.com/80/ff6600/ffffff?text=VP' }, matches: 10, kills: 58, headshots: 14, damage: 9643.71, assists: 27, avgDamage: 964.37, longestKill: 382 },
    { rank: 2, teamId: { name: 'eArena', logo: 'https://via.placeholder.com/80/ff0055/ffffff?text=EA' }, matches: 10, kills: 52, headshots: 10, damage: 9707.86, assists: 38, avgDamage: 970.79, longestKill: 450 },
    { rank: 3, teamId: { name: 'Sharper Esports', logo: 'https://via.placeholder.com/80/0044ff/ffffff?text=SE' }, matches: 10, kills: 48, headshots: 13, damage: 8884.57, assists: 19, avgDamage: 888.46, longestKill: 412 },
    { rank: 4, teamId: { name: 'DN SOOPers', logo: 'https://via.placeholder.com/80/00ccff/ffffff?text=DN' }, matches: 10, kills: 48, headshots: 11, damage: 8781.48, assists: 42, avgDamage: 878.15, longestKill: 135 },
    { rank: 5, teamId: { name: '17Gaming', logo: 'https://via.placeholder.com/80/ffaa00/ffffff?text=17' }, matches: 10, kills: 48, headshots: 10, damage: 7511.88, assists: 27, avgDamage: 751.19, longestKill: 490 },
    { rank: 6, teamId: { name: 'Twisted Minds', logo: 'https://via.placeholder.com/80/9900ff/ffffff?text=TM' }, matches: 10, kills: 46, headshots: 7, damage: 9137.53, assists: 27, avgDamage: 913.75, longestKill: 298 }
];

const MOCK_PLAYERS_DATA = [
    { rank: 1, playerName: 'xmpl', teamName: 'Virtus.pro', logo: 'https://via.placeholder.com/80/ff6600/ffffff?text=xmpl', matches: 10, kills: 22, headshots: 6, damage: 3450.20, assists: 10, avgDamage: 345.02, longestKill: 382 },
    { rank: 2, playerName: 'Licker', teamName: 'eArena', logo: 'https://via.placeholder.com/80/ff0055/ffffff?text=Licker', matches: 10, kills: 19, headshots: 4, damage: 3200.50, assists: 12, avgDamage: 320.05, longestKill: 450 },
    { rank: 3, playerName: 'Pio', teamName: 'Gen.G', logo: 'https://via.placeholder.com/80/ffcc00/ffffff?text=Pio', matches: 10, kills: 18, headshots: 5, damage: 2980.10, assists: 8, avgDamage: 298.01, longestKill: 310 },
    { rank: 4, playerName: 'Inonix', teamName: 'DN SOOPers', logo: 'https://via.placeholder.com/80/00ccff/ffffff?text=Inonix', matches: 10, kills: 17, headshots: 3, damage: 2890.40, assists: 14, avgDamage: 289.04, longestKill: 220 },
    { rank: 5, playerName: 'shou', teamName: '17Gaming', logo: 'https://via.placeholder.com/80/ffaa00/ffffff?text=shou', matches: 10, kills: 16, headshots: 4, damage: 2750.80, assists: 9, avgDamage: 275.08, longestKill: 490 }
];

export const StatsTab = ({ stages = [] }) => {
    // Stage & Group selection state
    const [selectedStageId, setSelectedStageId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');

    // View & Sorting states
    const [viewMode, setViewMode] = useState('teams'); // 'players' | 'teams'
    const [sortBy, setSortBy] = useState('kills'); // 'kills' | 'damage'
    const [loading, setLoading] = useState(false);

    // Carousel state for <= 768px
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const carouselRef = useRef(null);

    const activeStageId = stages.some(stage => (stage._id || stage.id) === selectedStageId)
        ? selectedStageId
        : (stages[0]?._id || stages[0]?.id || '');
    const currentStage = stages.find(stage => (stage._id || stage.id) === activeStageId);
    const availableGroups = currentStage?.groups || [];
    const activeGroupId = availableGroups.some(
        group => (group._id || group.id) === selectedGroupId
    )
        ? selectedGroupId
        : (availableGroups[0]?._id || availableGroups[0]?.id || '');

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 300);
    };

    // Sort dataset based on metric selection
    const sortedData = useMemo(() => {
        const rawData = viewMode === 'teams' ? [...MOCK_TEAMS_DATA] : [...MOCK_PLAYERS_DATA];
        
        return rawData.sort((a, b) => {
            if (sortBy === 'kills') {
                return b.kills - a.kills || b.damage - a.damage;
            } else {
                return b.damage - a.damage || b.kills - a.kills;
            }
        }).map((item, idx) => ({ ...item, rank: idx + 1 }));
    }, [viewMode, sortBy]);

    const top5Data = useMemo(() => sortedData.slice(0, 5), [sortedData]);

    // Track active scroll card index on mobile carousel
    const handleCarouselScroll = () => {
        if (!carouselRef.current) return;
        const { scrollLeft, clientWidth } = carouselRef.current;
        const newIndex = Math.round(scrollLeft / clientWidth);
        setActiveCardIndex(newIndex);
    };

    const scrollCarouselTo = (index) => {
        if (!carouselRef.current) return;
        const cardWidth = carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({
            left: cardWidth * index,
            behavior: 'smooth'
        });
        setActiveCardIndex(index);
    };

    // Table Column Config
    const columns = useMemo(() => {
        const entityColumn = viewMode === 'teams' 
            ? {
                header: 'TEAM',
                accessor: 'teamName',
                cell: (row) => (
                    <div className="table-team-cell">
                        <img src={row.teamId?.logo} alt="logo" />
                        <span>{row.teamId?.name}</span>
                    </div>
                )
            }
            : {
                header: 'PLAYER',
                accessor: 'playerName',
                cell: (row) => (
                    <div className="table-team-cell">
                        <img src={row.logo} alt="logo" />
                        <div className="player-info">
                            <span className="player-name">{row.playerName}</span>
                            <span className="team-subtext">{row.teamName}</span>
                        </div>
                    </div>
                )
            };

        return [
            {
                header: 'RANK',
                accessor: 'rank',
                cell: (row) => <span className="rank-cell">#{row.rank}</span>
            },
            entityColumn,
            { header: 'MATCHES', accessor: 'matches' },
            { 
                header: 'KILLS(HS)', 
                accessor: 'kills',
                cell: (row) => `${row.kills}(${row.headshots})`
            },
            { 
                header: 'DMG DEALT', 
                accessor: 'damage',
                cell: (row) => row.damage?.toLocaleString()
            },
            { header: 'ASSISTS', accessor: 'assists' },
            { 
                header: 'AVG.DMG DEALT', 
                accessor: 'avgDamage',
                cell: (row) => row.avgDamage?.toLocaleString()
            },
            { 
                header: 'LONGEST KILL', 
                accessor: 'longestKill',
                cell: (row) => `${row.longestKill}m`
            }
        ];
    }, [viewMode]);

    return (
        <div className="stats-tab-container">
            {/* Filter Bar */}
            <div className="stats-filter-bar">
                <select 
                    value={activeStageId} 
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="filter-select"
                >
                    {stages.length > 0 ? stages.map((stage) => (
                        <option key={stage._id || stage.id} value={stage._id || stage.id}>
                            {stage.name?.toUpperCase() || 'STAGE'}
                        </option>
                    )) : <option value="">FINAL STAGE</option>}
                </select>

                {availableGroups.length > 0 ? (
                    <select 
                        value={activeGroupId} 
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="filter-select"
                    >
                        {availableGroups.map((group) => (
                            <option key={group._id || group.id} value={group._id || group.id}>
                                {group.name?.toUpperCase()}
                            </option>
                        ))}
                    </select>
                ) : (
                    <select className="filter-select" disabled>
                        <option>ALL GROUPS</option>
                    </select>
                )}

                <button className="refresh-btn" onClick={handleRefresh} title="Refresh">
                    &#x21bb;
                </button>
            </div>

            {/* Players / Teams View Toggle */}
            <div className="view-toggle-container">
                <button 
                    className={`view-toggle-btn ${viewMode === 'players' ? 'active' : ''}`}
                    onClick={() => setViewMode('players')}
                >
                    Players
                </button>
                <button 
                    className={`view-toggle-btn ${viewMode === 'teams' ? 'active' : ''}`}
                    onClick={() => setViewMode('teams')}
                >
                    Teams
                </button>
            </div>

            {/* Sort Metric Selector */}
            <div className="sort-selector-container">
                <button 
                    className={`sort-btn ${sortBy === 'kills' ? 'active' : ''}`}
                    onClick={() => setSortBy('kills')}
                >
                    KILL TOP 5
                </button>
                <button 
                    className={`sort-btn ${sortBy === 'damage' ? 'active' : ''}`}
                    onClick={() => setSortBy('damage')}
                >
                    DAMAGE TOP 5
                </button>
            </div>

            {/* Top 5 Cards Container with Carousel behavior on mobile */}
            <div className="top-cards-wrapper">
                <div 
                    className="top-cards-grid" 
                    ref={carouselRef} 
                    onScroll={handleCarouselScroll}
                >
                    {top5Data.map((item) => (
                        <div className="carousel-card-item" key={item.rank}>
                            <StatsCard 
                                rank={item.rank}
                                name={viewMode === 'teams' ? item.teamId.name : item.playerName}
                                logo={viewMode === 'teams' ? item.teamId.logo : item.logo}
                                kills={item.kills}
                                damage={item.damage}
                                activeMetric={sortBy}
                            />
                        </div>
                    ))}
                </div>

                {/* Carousel Pagination Dots (Visible <= 768px) */}
                <div className="carousel-dots">
                    {top5Data.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${activeCardIndex === index ? 'active' : ''}`}
                            onClick={() => scrollCarouselTo(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Main Stats Table */}
            {loading ? (
                <div className="stats-loading">Loading stats...</div>
            ) : (
                <div className="stats-table-wrapper">
                    <DataTable columns={columns} data={sortedData} />
                </div>
            )}
        </div>
    );
};