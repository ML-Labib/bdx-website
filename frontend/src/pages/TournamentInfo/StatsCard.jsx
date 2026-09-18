import React from 'react';

export const StatsCard = ({ rank, name, logo, kills, damage, activeMetric }) => {
    return (
        <div className="stats-card">
            {/* Top Rank Badge */}
            <div className="stats-card-rank">#{rank}</div>

            {/* Logo/Image Container */}
            <div className="stats-card-logo-container">
                <img src={logo || '/default-logo.png'} alt={name} className="stats-card-logo" />
            </div>

            {/* Entity Name */}
            <div className="stats-card-name">{name}</div>

            {/* Metrics Breakdown */}
            <div className="stats-card-metrics">
                <div className={`metric-box ${activeMetric === 'kills' ? 'active' : ''}`}>
                    <span className="metric-label">KILLS</span>
                    <span className="metric-value">{kills}</span>
                </div>
                <div className={`metric-box ${activeMetric === 'damage' ? 'active' : ''}`}>
                    <span className="metric-label">DAMAGE</span>
                    <span className="metric-value">{damage?.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};