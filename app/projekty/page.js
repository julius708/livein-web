import { projects } from "@/lib/developer-projects";
import "@/components/developer-project.css";

export const metadata = {
  title: "Ukážky projektov | LIVE-IN · interné",
  robots: { index: false, follow: false },
};

// Interný rozcestník na stretnutia. Z verejných projektových stránok sa naň neodkazuje,
// aby jeden developer nevidel projekt druhého.
export default function Index() {
  return (
    <div className="dp">
      <div className="dp-preview">INTERNÉ · rozcestník ukážok pre LIVE-IN, nezdieľať s developermi</div>
      <main id="obsah" className="dp-wrap dp-section">
        <div className="dp-kicker">Ukážky pre developerov</div>
        <h1 className="dp-pipe-h1">
          Projektové stránky
          <span>na stretnutia a e-maily.</span>
        </h1>
        <ol className="dp-cards">
          {Object.entries(projects).map(([id, p]) => (
            <li key={id}>
              <b>
                <a href={`/projekty/${id}`}>{p.name}</a>
              </b>
              <span>
                {p.partner} · {p.location}. Verejný odkaz pre tohto developera: /projekty/{id}
              </span>
            </li>
          ))}
          <li>
            <b>
              <a href="/projekty/prehlad-dopytov">Prehľad dopytov (ukážka pre developera)</a>
            </b>
            <span>Stavy dopytu, provízia a pohľad developera. Ukážkové dáta bez skutočných osôb.</span>
          </li>
        </ol>
      </main>
    </div>
  );
}
