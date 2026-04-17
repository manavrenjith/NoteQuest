// Navbar.jsx — single component, adapts per page
import { useLocation, useNavigate } from "react-router-dom";

const appLinks = [
  { label: "Dashboard",    path: "/"           },
  { label: "Upload notes", path: "/upload"     },
  { label: "Leaderboard",  path: "/leaderboard"},
  { label: "Settings",     path: "/settings"   },
];

export default function Navbar({ xp = 350, rank = "Scholar" }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Landing page: no auth, show marketing links
  const isLanding = pathname === "/" && !xp;

  return (
    <nav className="nav">
      <a className="logo" onClick={() => navigate("/")}>
        <div className="logo-dot" />
        <span className="logo-text">NoteQuest</span>
      </a>

      <div className="nav-links">
        {isLanding ? (
          <>
            <button className="nav-link">How it works</button>
            <button className="nav-link">Features</button>
            <div className="divider" />
            <button className="nav-btn" onClick={() => navigate("/")}>Dashboard</button>
            <button className="nav-btn nav-btn-primary">Get started</button>
          </>
        ) : (
          <>
            {appLinks.map(({ label, path }) => (
              <button
                key={path}
                className={`nav-link ${pathname === path ? "active" : ""}`}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            ))}
            <div className="divider" />
            <div className="xp-pill">
              <div className="xp-dot" />
              <span className="xp-val">{xp} XP</span>
              <span>· {rank}</span>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}