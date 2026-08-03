import { SubHeader } from "../../components/SubHeader"
import { PersonCard } from "./PersonCard.jsx"

import "./aboutUs.css";


export function AboutUs() {
    const leaderData = [
        {
            id: 1,
            name: "MMM Showaib",
            code: "DELTA [00]",
            nationality: "Bangladesh",
            playerImage: "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/admins/showaib-removebg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L2FkbWlucy9zaG93YWliLXJlbW92ZWJnLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU0NDY1MzksImV4cCI6NDkwNzUxMDUzOX0.il5T4PcjVbcmGquzuGy8xMdyeOp5VU05E52XzhkkuBk",
        },
        {
            id: 2,
            name: "Priotosh",
            code: "DELTA [99]",
            nationality: "Bangladesh",
            playerImage: "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/admins/Priotosh-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L2FkbWlucy9QcmlvdG9zaC1yZW1vdmViZy1wcmV2aWV3LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU0NDY0MjksImV4cCI6NDkwNzUxMDQyOX0.itdU_A94bqNqBiHvCOdxQSgYpJyHcE9Jfu7uB3o-d8Q",
        }
    ]

    const adminData = [
        {
            id: 1,
            name: "ML Labib",
            code: "-",
            nationality: "Bangladesh",
            playerImage: "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/players/Labib-no-bg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L3BsYXllcnMvTGFiaWItbm8tYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTQ0NjM3OCwiZXhwIjo0OTA3NTEwMzc4fQ.Qw564o3jXFC5g4UlY73pMdnMJwAAh8nJL4Js1j2yrNk",
        },
        {
            id: 2,
            name: "Tami",
            code: "-",
            nationality: "Bangladesh",
            playerImage: "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/admins/Prisoner-min-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L2FkbWlucy9Qcmlzb25lci1taW4tcmVtb3ZlYmctcHJldmlldy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1NDQ2NDU1LCJleHAiOjQ5MDc1MTA0NTV9.lth_alq7brpxQ4mTw7_ztZe2k6cyEw9etvg7oxwaxFE",
        },
        {
            id: 3,
            name: "Ruhit",
            code: "-",
            nationality: "Bangladesh",
            playerImage: "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/admins/Ruhit-min-removebg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L2FkbWlucy9SdWhpdC1taW4tcmVtb3ZlYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTQ0NjUwOSwiZXhwIjo0OTA3NTEwNTA5fQ.So_aIvlzGSM-KT_qA5iJvRM7SsO6Vdrw6bGIbM7BvW4",
        },
        {
            id: 4,
            name: "Adib",
            code: "-",
            nationality: "Bangladesh",
            playerImage: "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/admins/Adib-min-removebg-preview.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L2FkbWlucy9BZGliLW1pbi1yZW1vdmViZy1wcmV2aWV3LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU0NDY2MDgsImV4cCI6NDkwNzUxMDYwOH0.NxFguQQXKqgmmbPupl54a85-lFfVrUzMIGuORQBb9OA",
        }
    ]

    return (
        <>
            <SubHeader subTitle="ABOUT US" />
            <div className="about-us-container">
                <div className="title-bar">
                    <svg
                        className="section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000" />
                    </svg>
                    <h2> Supreme Leaders of BD-EXTREME</h2>
                </div>
                <div className="supreme-leaders-container">
                    {leaderData.map((player) => (
                        <PersonCard key={player.id} player={player} />
                    ))}
                </div>

                <div className="title-bar">
                    <svg
                        className="section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000" />
                    </svg>
                    <h2> Admins of BD-EXTREME</h2>

                </div>
                <div className="supreme-leaders-container">
                    {adminData.map((player) => (
                        <PersonCard key={player.id} player={player} />
                    ))}
                </div>
            </div>
        </>
    );
}