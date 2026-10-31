# SwingMatrix

A browser-side simulation engine for Kenyan electoral outcomes. SwingMatrix takes a set of user-defined assumptions — demographic and economic conditions, information shocks, and candidate attributes — and computes how a hypothetical electorate would distribute its vote under those conditions.

**SwingMatrix is not an election prediction tool.** It does not claim to know who will win. The distinction is treated at length inside the app, on the Disclaimer page.

---

## Live app

The app is deployed automatically to GitHub Pages on every push to `main`. The URL is:

```
https://<your-username>.github.io/<repo-name>/
```

Once deployed, it runs entirely in the browser. No server, no login, no data sent anywhere.

---

## What it does

- Models a Kenyan election across six seats: President, Governor, Senator, Women Representative, Member of Parliament, and Member of County Assembly.
- Simulates outcomes at national scope or within any of Kenya's 47 counties.
- Lets you add, remove, and configure any number of candidates. Each candidate has five policy-position sliders and a qualitative bias slider.
- For President and Governor races, each candidate carries a running mate whose attributes can be configured independently. The running mate's effect on the principal's final share is capped at ±5%.
- Lets you adjust six demographic and economic sliders. Four of them are backed by live World Bank data; the remaining two are derived or qualitative.
- Lets you toggle four binary shocks: misinformation campaign, incumbent corruption scandal, registration drive, adverse news sentiment.
- Recomputes all candidate shares in real time via 500-iteration Monte Carlo simulation.
- Displays a 10th-to-90th percentile band per candidate, a sensitivity table ranking which inputs move the leading candidate's share most, and a provenance footer listing the indicator codes and observation years in use.

---

## Live data

Two sources are queried directly from the browser on app load. No keys, no proxy, no server.

**World Bank Indicators API** — `api.worldbank.org/v2`. Provides youth unemployment, adult literacy, female labour force participation, and poverty headcount. On first load, the app fetches the latest observation for each and updates the corresponding slider — but only if the user has not already dragged that slider. Slider values you set manually are preserved. Responses are cached in-memory for 24 hours. Sliders seeded from the API display a green *Live · YYYY* badge showing the observation year.

**GDELT DOC 2.0** — `api.gdeltproject.org/api/v2/doc/doc`. Provides recent English-language Kenya political coverage. On first render of the results column, the app fetches up to 20 recent articles and displays the five most recent in a *News pulse* panel. Each headline is classified as adverse or neutral by a keyword pattern. A sentiment magnitude is computed from the adverse ratio and total volume. When the *Adverse news sentiment shock* toggle is enabled, the engine applies −0.6 × magnitude as a utility penalty to the incumbent candidate. Responses are cached in-memory for 15 minutes.

**Registered voters.** County-level registered-voter totals are embedded in the source from the IEBC 2025 gazette (national total: 22,102,532). These are the aggregation weights.

**Graceful degradation.** If either API is unreachable, the app continues working. Sliders keep their documented defaults, the news shock applies as zero, and the failure is disclosed in the provenance footer and News pulse panel respectively. No blank screens, no unhandled errors.

---

## Technology

- React 18 + TypeScript
- Vite for build
- Zustand for state
- No UI framework — styles are hand-authored CSS with design tokens in `src/styles/global.css`

---

## Repository structure

```
src/
  api/           World Bank, GDELT, Google News clients; bootstrap layers
  components/    UI components (layout, controls, candidates, results, hierarchy)
  constants/     47-county table, slider/toggle definitions
  engine/        Spatial-voting model, Monte Carlo, running-mate cap
  pages/         Simulator, Docs, Disclaimer
  store/         Zustand store, selectors, defaults
  styles/        Global CSS and design tokens
  types/         Shared TypeScript types
  App.tsx        View router and bootstrap triggers
  main.tsx       Entry point
```

---

## Development

There is no local build step in the development workflow. Every commit is pushed directly through GitHub's web interface, and the GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

**Enabling the first deployment:**

1. Go to the repository's **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`. The workflow runs, builds, and deploys automatically.

To verify a deployment, open the **Actions** tab. The most recent run should show a green check. A grey exclamation means a build was cancelled because a newer commit superseded it — that is expected on rapid pushes and is not a failure. A red X means the build broke and the current repository state is not deployable.

---

## Model

The engine implements a spatial-voting model with a logit link:

```
U(i, c) = − Σ_d  w_d · ((x_i,d − x_c,d) / 100)²
        + qual(c)
        + shock(i, c)

P(i, c) = exp(U(i, c)) / Σ_k exp(U(i, k))
```

For each candidate, 500 independent draws of `shock` are taken and the mean and 10th/90th percentile share are reported.

Full details — including the running-mate cap, the qualitative slider, the news-sentiment magnitude formula, and known limitations — are on the Documentation page inside the app.

---

## License

Not yet specified. Treat as all rights reserved until a license is chosen.
