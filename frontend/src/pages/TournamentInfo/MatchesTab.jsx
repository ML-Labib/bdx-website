import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../components/DataTable.jsx'; // Ensure correct path to your DataTable component
import { PageHeader } from '../../components/PageHeader.jsx'; // Ensure correct path to your PageHeader component
import './matchesTab.css';

import defaulteamLogo from '../../assets/default-team-logo.png';

const getMapBg = (mapName) => {
    switch (mapName?.toUpperCase()) {
        case 'ERANGEL': return '/maps/erangel.jpg';
        case 'MIRAMAR': return '/maps/miramar.jpg';
        case 'TAEGO': return '/maps/taego.jpg';
        case 'RONDO': return '/maps/rondo.jpg';
        case 'VIKENDI': return '/maps/vikendi.jpg';
        default: return '/maps/default.jpg';
    }
};

const formatDateHeader = (dateString) => {
    if (dateString === 'Unscheduled') return 'Unscheduled Matches';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNumber = date.getDate();

    return `${dayName} | ${month} ${dayNumber}`;
};

export const MatchesTab = ({ tournamentId, stages = [] }) => {
    const [selectedStageId, setSelectedStageId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [availableGroups, setAvailableGroups] = useState([]);
    const [groupedMatches, setGroupedMatches] = useState([]);
    const [loading, setLoading] = useState(false);

    // State to track which match is currently expanded
    const [expandedMatchId, setExpandedMatchId] = useState(null);

    // 1. Initialize Stage Selection Safely
    useEffect(() => {
        if (stages && stages.length > 0) {
            const firstStageId = stages[0]._id || stages[0].id; // Fallback to .id just in case

            // Check if our current selected stage actually exists in the stages array
            const isCurrentStageValid = stages.some(s => (s._id || s.id) === selectedStageId);

            // ONLY update state if invalid to prevent infinite loops
            if (!isCurrentStageValid && firstStageId) {
                setSelectedStageId(firstStageId);
            }
        }
    }, [stages, selectedStageId]);

    // 2. Update Group Selection Safely
    useEffect(() => {
        if (!stages || stages.length === 0 || !selectedStageId) return;

        const currentStage = stages.find(s => (s._id || s.id) === selectedStageId);

        if (currentStage && currentStage.groups && currentStage.groups.length > 0) {

            // Prevent replacing the array with a new reference if the groups are identical
            setAvailableGroups(prev => {
                const isIdentical = prev.length === currentStage.groups.length &&
                    prev.every((g, i) => (g._id || g.id) === (currentStage.groups[i]._id || currentStage.groups[i].id));
                return isIdentical ? prev : currentStage.groups;
            });

            const validGroupIds = currentStage.groups.map(g => g._id || g.id);

            // ONLY update group state if the current group ID doesn't belong to this stage
            if (!validGroupIds.includes(selectedGroupId)) {
                setSelectedGroupId(validGroupIds[0]);
            }

        } else {
            // Safe reset
            setAvailableGroups(prev => prev.length === 0 ? prev : []);
            if (selectedGroupId !== '') {
                setSelectedGroupId('');
            }
        }
    }, [stages, selectedStageId, selectedGroupId]);

    // 3. Fetch Matches
    // const fetchMatches = async () => {
    //     if (!tournamentId || !selectedStageId) return;

    //     setLoading(true);
    //     try {
    //         let url = `/api/leaderboard/matches/${tournamentId}/${selectedStageId}`;
    //         if (selectedGroupId) {
    //             url += `?groupId=${selectedGroupId}`;
    //         }

    //         const response = await fetch(url);
    //         const data = await response.json();

    //         // Handle multiple potential backend response structures safely
    //         if (data.success && data.data) {
    //             setGroupedMatches(data.data);
    //         } else if (Array.isArray(data.farmatedMatches)) {
    //             setGroupedMatches(data.farmatedMatches);
    //         } else if (Array.isArray(data.formattedMatches)) {
    //             setGroupedMatches(data.formattedMatches);
    //         } else if (Array.isArray(data)) {
    //             setGroupedMatches(data);
    //         } else {
    //             setGroupedMatches([]);
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch matches:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // 3. Fetch Matches
    const fetchMatches = async () => {
        if (!tournamentId || !selectedStageId) return;

        setLoading(true);
        try {
            let url = `/api/leaderboard/matches/${tournamentId}/${selectedStageId}`;
            if (selectedGroupId) {
                url += `?groupId=${selectedGroupId}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            // const data = [];

            // Handle multiple potential backend response structures safely
            if (data.success && data.data) {
                setGroupedMatches(data.data);
            } else if (Array.isArray(data.farmatedMatches)) {
                setGroupedMatches(data.farmatedMatches);
            } else if (Array.isArray(data.formattedMatches)) {
                setGroupedMatches(data.formattedMatches);
            } else if (Array.isArray(data)) {
                setGroupedMatches(data);
            } else {
                setGroupedMatches([]);
            }
        } catch (error) {
            console.error("Failed to fetch matches:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMatches();
        // Close any expanded table when filters change
        setExpandedMatchId(null);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tournamentId, selectedStageId, selectedGroupId]);

    // Toggle Expand/Collapse
    const toggleMatch = (matchId) => {
        setExpandedMatchId(prev => prev === matchId ? null : matchId);
    };

    // Table Columns Configuration
    const columns = useMemo(() => [
        {
            header: 'RANK',
            accessor: 'placement',
            cell: (row) => <span className="rank-cell">#{row.placement}</span>
        },
        {
            header: 'TEAM',
            accessor: 'teamName', // Used for sorting
            sortValue: (row) => row.teamId?.name || '',
            cell: (row) => (
                <div className="team-cell">
                    <img src={row.teamId?.logo || defaulteamLogo} alt="logo" />
                    <span>{row.teamId?.name || 'Unknown Team'}</span>
                </div>
            )
        },
        { header: 'TOTAL', accessor: 'totalPoints' },
        { header: 'PLACE', accessor: 'placementPoints' },
        { header: 'KILL', accessor: 'kills' }
    ], []);

    return (
        <>
            {stages.length > 0 && (
                <div className="search-filters">
                    <div className="search-wrap">
                        <div className="select-group">
                            <select
                                value={selectedStageId}
                                onChange={(e) => setSelectedStageId(e.target.value)}
                                className="filter-select"
                            >
                                {stages.map((stage) => (
                                    <option key={stage._id || stage.id} value={stage._id || stage.id}>
                                        {stage.name?.toUpperCase() || 'STAGE'}
                                    </option>
                                ))}
                            </select>

                            {availableGroups.length > 0 && (
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="filter-select"
                                >
                                    {availableGroups.map((group) => (
                                        <option key={group._id || group.id} value={group._id || group.id}>
                                            {group.name?.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button className="refresh-btn" onClick={fetchMatches} title="Refresh">
                                &#x21bb;
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <div className="match-list-container">
                {loading ? (
                    <div className="matches-loading">Loading matches...</div>
                ) : groupedMatches.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-symbols-outlined">
                            scoreboard
                        </span>
                        <p>
                            No matches found
                        </p>

                    </div>
                ) : (
                    <div className="matches-group-list">
                        {groupedMatches.map((group, index) => (
                            <div key={group.date || index} className="day-group">
                                {/* <div className="day-header">
                                        <span className="yellow-accent">/</span> {formatDateHeader(group.date)}
                                    </div> */}
                                <PageHeader title={formatDateHeader(group.date)} />

                                <div className="day-matches">
                                    {group.matches && group.matches.map((match) => {
                                        const isExpanded = expandedMatchId === match._id;

                                        return (
                                            <div key={match._id} className={`match-card ${isExpanded ? 'expanded' : ''}`}>
                                                {/* Clickable Header */}
                                                <div className="match-card-header" onClick={() => toggleMatch(match._id)}>
                                                    <div className="expand-icon">
                                                        <span className="material-symbols-outlined">
                                                            keyboard_arrow_right
                                                        </span>
                                                    </div>
                                                    <div className="match-card-left">
                                                        <span className="match-title">MATCH {match.matchNumber}</span>
                                                    </div>

                                                    <div className="match-card-right">
                                                        {/* Show team logos only if teamResults exist and have length */}
                                                        {match.teamResults && match.teamResults.length > 0 && (
                                                            <div className="team-logos">
                                                                {match.teamResults.slice(0, 4).map((res, idx) => (
                                                                    <img
                                                                        key={idx}
                                                                        src={res.teamId?.logo || defaulteamLogo}
                                                                        alt={res.teamId?.name || 'Team Logo'}
                                                                        className="team-logo-img"
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="map-banner" style={{ backgroundImage: `url(${getMapBg(match.mapName)})` }}>
                                                            <div className="map-overlay"></div>
                                                            <span className="map-name">{match.mapName?.toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Table Content */}
                                                <div className="match-card-expand-wrapper">
                                                    <div className="match-card-expand-inner">
                                                        <DataTable columns={columns} data={match.teamResults || []} />
                                                        <div className="show-more">
                                                            <button
                                                                className="show-more-btn"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setExpandedMatchId(null);
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined">close_small</span>
                                                                <span>close</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </>
    );
};

