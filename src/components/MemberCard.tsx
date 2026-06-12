"use client";

import type { Member } from "@/types/member";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <article className="card">
      <div
        className="bg"
        style={{ backgroundImage: `url(${member.photoUrl || "/globe.svg"})` }}
      />
      <div className="overlay" />
      <div className="content">
        <div>
          <h3 className="name">{member.name}</h3>
          <p className="role">{member.role}</p>
        </div>

        <div className="meta">
          <span className="team">{member.team}</span>
          <div className="links">
            {member.email ? <span className="email">{member.email}</span> : null}
            {member.linkedin ? (
              <a className="link" href={member.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          position: relative;
          width: 280px;
          height: 380px;
          border-radius: 22px;
          overflow: hidden;
          background: #0b1220;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 26px 70px rgba(0, 0, 0, 0.55);
        }
        .bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: grayscale(25%) brightness(0.75);
          transform: scale(1.05);
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
              circle at 20% 0%,
              rgba(218, 203, 136, 0.18),
              transparent 45%
            ),
            linear-gradient(to top, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0.25));
        }
        .content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 22px;
          color: #fff;
          backdrop-filter: blur(10px);
        }
        .name {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .role {
          margin: 10px 0 0 0;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.85;
        }
        .meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .team {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dacb88;
        }
        .links {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          opacity: 0.9;
        }
        .email {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          opacity: 0.85;
        }
        .link {
          width: fit-content;
          font-weight: 900;
          text-decoration: none;
          color: #dacb88;
        }
        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </article>
  );
}