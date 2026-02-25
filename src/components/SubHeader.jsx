import React from 'react';
import "./subHeader.css";

export function SubHeader({ subTitle }) {
    return (
        <div className="subheader-wrapper">
            <div className="bg-half bg-left"></div>
            <div className="bg-half bg-right"></div>
            <div className="subheader-content">
                <h1>{subTitle}</h1>
            </div>
        </div>
    );
}