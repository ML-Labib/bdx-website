
import React, { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../../components/DataTable.jsx';
import './matchesTab.css';
import './rankingTab.css';

export function RankingTab({ tournamentId, stages = [] }) {
    const [selectedStageId, setSelectedStageId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [availableGroups, setAvailableGroups] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const firstStageId = stages[0]?._id || stages[0]?.id || '';
        const hasSelectedStage = stages.some(
            (stage) => (stage._id || stage.id) === selectedStageId
        );

        if (!hasSelectedStage) {
            setSelectedStageId(firstStageId);
        }
    }, [stages, selectedStageId]);

    useEffect(() => {
        const selectedStage = stages.find(
            (stage) => (stage._id || stage.id) === selectedStageId
        );
        const groups = selectedStage?.groups || [];
        const groupIds = groups.map((group) => group._id || group.id);

        setAvailableGroups(groups);
        setSelectedGroupId((currentGroupId) =>
            groupIds.includes(currentGroupId) ? currentGroupId : (groupIds[0] || '')
        );
    }, [stages, selectedStageId]);

    const fetchRanking = async () => {
        if (!tournamentId || !selectedStageId) {
            setRankings([]);
            return;
        }

        setLoading(true);
        try {
            const query = selectedGroupId ? `?groupId=${encodeURIComponent(selectedGroupId)}` : '';
            const response = await fetch(
                `/api/leaderboard/matches/ranking/${tournamentId}/${selectedStageId}${query}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch ranking');
            }

            const result = await response.json();
            const data = Array.isArray(result) ? result : result.data;
            setRankings(Array.isArray(data)
                ? data.map((row) => ({ ...row, id: row.team?._id || row.rank }))
                : []);
        } catch (error) {
            console.error('Failed to fetch ranking:', error);
            setRankings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tournamentId, selectedStageId, selectedGroupId]);

    const columns = useMemo(() => [
        {
            header: 'RANK',
            accessor: 'rank',
            sortable: false,
            cell: (row) => <span className="rank-cell">#{row.rank}</span>
        },
        {
            header: 'TEAM',
            accessor: 'teamName',
            sortValue: (row) => row.team?.name || '',
            cell: (row) => (
                <div className="team-cell">
                    <img src={row.team?.logo || '/default-team.png'} alt="" />
                    <span>{row.team?.name || 'Unknown Team'}</span>
                </div>
            )
        },
        { header: 'TOTAL', accessor: 'totalPoints' },
        { header: 'PLACE', accessor: 'placementPoints' },
        { header: 'KILL', accessor: 'kills' },
        { header: 'WWCD', accessor: 'wwdc' },
        { header: 'MATCHES', accessor: 'matchesPlayed' }
    ], []);

    return (
        <div className="ranking-tab matches-tab-container">
            <div className="matches-filter-bar">
                <select
                    value={selectedStageId}
                    onChange={(event) => setSelectedStageId(event.target.value)}
                    className="filter-select"
                    aria-label="Select stage"
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
                        onChange={(event) => setSelectedGroupId(event.target.value)}
                        className="filter-select"
                        aria-label="Select group"
                    >
                        {availableGroups.map((group) => (
                            <option key={group._id || group.id} value={group._id || group.id}>
                                {group.name?.toUpperCase() || 'GROUP'}
                            </option>
                        ))}
                    </select>
                )}

                <button className="refresh-btn" onClick={fetchRanking} title="Refresh" aria-label="Refresh ranking">
                    &#x21bb;
                </button>
            </div>

            {loading ? (
                <div className="matches-loading">Loading ranking...</div>
            ) : rankings.length === 0 ? (
                <div className="no-matches">No ranking data available for this selection.</div>
            ) : (
                <DataTable columns={columns} data={rankings} />
            )}
        </div>
    );
}