const styles = `
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--sp-7) var(--sp-5) var(--sp-8);
}
.page h1 {
  font-size: var(--fs-3xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: var(--sp-3);
}
.page h2 {
  font-size: var(--fs-xl);
  font-weight: 600;
  margin-top: var(--sp-7);
  margin-bottom: var(--sp-3);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--border-subtle);
}
.page h3 {
  font-size: var(--fs-lg);
  font-weight: 600;
  margin-top: var(--sp-5);
  margin-bottom: var(--sp-2);
  color: var(--text-primary);
}
.page p {
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: var(--sp-4);
  font-size: var(--fs-base);
}
.page p strong { color: var(--text-primary); font-weight: 600; }
.page ul, .page ol {
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: var(--sp-4);
  padding-left: var(--sp-5);
}
.page li { margin-bottom: var(--sp-2); }
.page code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--bg-inset);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-primary);
}
.page__meta {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--sp-6);
  display: block;
}
.page__lede {
  font-size: var(--fs-lg);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-5);
  border-bottom: 1px solid var(--border-subtle);
}
.eq {
  display: block;
  padding: var(--sp-4) var(--sp-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--accent-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  color: var(--text-primary);
  line-height: 1.9;
  margin: var(--sp-3) 0 var(--sp-4);
  overflow-x: auto;
}
.indicator-table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--sp-3) 0 var(--sp-4);
  font-size: var(--fs-sm);
}
.indicator-table th {
  text-align: left;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-strong);
  color: var(--text-muted);
  font-weight: 500;
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.indicator-table td {
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  vertical-align: top;
}
.indicator-table td:first-child {
  font-family: var(--font-mono);
  color: var(--text-primary);
  white-space: nowrap;
  font-size: var(--fs-xs);
}
.steps {
  counter-reset: step;
  list-style: none;
  padding-left: 0;
}
.steps li {
  counter-increment: step;
  position: relative;
  padding-left: 40px;
  margin-bottom: var(--sp-4);
}
.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent-primary-soft);
  color: var(--accent-primary);
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  font-weight: 600;
  display: grid;
  place-items: center;
}
`;

export function DocsPage() {
  return (
    <>
      <style>{styles}</style>
      <article className="page">
        <span className="page__meta">Technical Documentation</span>
        <h1>How SwingMatrix works</h1>
        <p className="page__lede">
          A complete account of the model, the data, the rules, and the ways to
          read the results without over-claiming. Sections are numbered for
          reference.
        </p>

        <h2>1. Overview</h2>
        <p>
          SwingMatrix is a browser-side simulation engine for Kenyan electoral
          outcomes. It models the vote as the aggregation of voter preferences
          across five policy dimensions, weighted by demographic and economic
          conditions that the user manipulates in real time. The output is a
          conditional estimate, not a forecast. The distinction is treated at
          length in the <em>On the limits of SwingMatrix</em> page.
        </p>
        <p>
          Every computation runs locally in the browser. No data is sent to a
          server. Every World Bank indicator and every GDELT query hits its
          public source directly from the browser, is cached in-memory for a
          short window, and is used to seed or update the simulation inputs. The
          app is designed so that if a data source becomes unreachable, the
          simulation continues using documented defaults and the failure is
          disclosed in the user interface rather than hidden.
        </p>

        <h2>2. What the engine computes</h2>
        <p>
          For the currently selected seat and geography, the engine produces
          three outputs per candidate:
        </p>
        <ul>
          <li>
            A <strong>mean share</strong>: the average of 500 independent
            Monte Carlo draws through the spatial-voting model.
          </li>
          <li>
            A <strong>10th–90th percentile band</strong>: the dispersion of the
            same 500 draws. This is a measure of model-internal uncertainty, not
            electoral uncertainty.
          </li>
          <li>
            A <strong>sensitivity ranking</strong>: for each slider and each
            toggle, the estimated swing in the leading candidate's share when
            that variable is moved across its range.
          </li>
        </ul>

        <h2>3. Data sources</h2>
        <p>
          All statistical inputs come from public, verified sources. No
          internally generated estimates are used in the simulation. The
          following World Bank indicator codes are read directly from{" "}
          <code>api.worldbank.org/v2</code>:
        </p>

        <table className="indicator-table">
          <thead>
            <tr>
              <th>Indicator code</th>
              <th>What it measures</th>
              <th>Range used</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SL.UEM.1524.ZS</td>
              <td>Youth unemployment (15–24), % of labour force</td>
              <td>5 – 35</td>
            </tr>
            <tr>
              <td>SE.ADT.LITR.ZS</td>
              <td>Adult literacy rate, age 15+</td>
              <td>50 – 95</td>
            </tr>
            <tr>
              <td>SL.TLF.CACT.FE.ZS</td>
              <td>Female labour force participation, age 15+</td>
              <td>30 – 85</td>
            </tr>
            <tr>
              <td>SI.POV.DDAY</td>
              <td>Poverty headcount at the international poverty line</td>
              <td>15 – 70</td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>Electoral register.</strong> Registered-voter totals for the
          47 counties are taken from the IEBC 2025 gazette (national total:
          22,102,532). These weights determine how bloc-level shares are
          aggregated to the national level.
        </p>

        <h2>4. The spatial-voting model</h2>
        <p>
          Every voter bloc (currently one per county) is assigned a utility for
          every candidate. The utility is a weighted negative squared distance
          in a five-dimensional policy space, plus qualitative terms, plus a
          Gumbel-distributed random shock:
        </p>

        <pre className="eq">
{`U(i, c) = − Σ_d  w_d · ((x_i,d − x_c,d) / 100)²
        + qual(c)
        + shock(i, c)`}
        </pre>

        <p>Where:</p>
        <ul>
          <li>
            <code>w_d</code> is the salience weight for dimension <code>d</code>,
            adjusted by the demographic sliders.
          </li>
          <li>
            <code>x_i,d</code> is the ideal position of bloc <code>i</code> on
            dimension <code>d</code>. For the current MVP all blocs share a
            national ideal of 50 on every dimension; per-county ideals derived
            from DHS subnational data are a planned extension.
          </li>
          <li>
            <code>x_c,d</code> is the candidate's stated position on dimension
            <code>d</code>, set by the user via the mini-sliders in each
            candidate card.
          </li>
          <li>
            <code>qual(c)</code> aggregates the qualitative modifiers: the
            candidate-level bias slider, the running-mate factor, and the
            incumbent-targeted effects.
          </li>
          <li>
            <code>shock(i, c)</code> is a Gumbel draw whose scale is influenced
            by turnout and the misinformation toggle.
          </li>
        </ul>

        <p>
          The salience weights are recomputed whenever a slider moves. For
          example, raising youth unemployment increases the weight on Economy;
          raising adult literacy increases the weight on Health &amp; Education.
          The formula is linear in the slider values, so salience moves smoothly
          with slider motion rather than in discontinuous jumps.
        </p>

        <p>
          Individual probabilities follow the standard logit form:
        </p>

        <pre className="eq">
{`P(i, c) = exp(U(i, c)) / Σ_k exp(U(i, k))`}
        </pre>

        <p>The share for candidate <code>c</code> is then:</p>

        <pre className="eq">
{`share(c) = Σ_i  weight(i) · P(i, c)`}
        </pre>

        <p>
          where <code>weight(i)</code> is the bloc's registered voters.
        </p>

        <h2>5. Monte Carlo uncertainty</h2>
        <p>
          A single logit draw with a Gumbel shock is a sample from a
          distribution. A single draw tells you almost nothing. SwingMatrix runs
          500 draws per computation and reports the mean and the 10th–90th
          percentile spread. The candidate rows therefore jitter slightly on
          each render; that jitter is the model's intrinsic variance and is not
          suppressed.
        </p>
        <p>
          The percentile band is not a confidence interval about the actual
          election. It reflects only how much variation the engine produces
          internally for the stated inputs. A tight band means the model is
          consistent in its conditional estimate. It does not mean the election
          will land within that band.
        </p>

        <h2>6. The running-mate cap</h2>
        <p>
          Running mates exist only for the President and Governor seats. Each
          running mate carries their own policy positions and a qualitative bias
          slider. The engine converts these into a multiplicative factor applied
          to the principal's mean share <em>after</em> Monte Carlo, then the
          whole vector is renormalised across all candidates.
        </p>
        <p>Two forces drive the factor:</p>
        <ul>
          <li>
            A <strong>moderation bonus</strong> (40% of the factor): running
            mates whose policy positions are close to the political centre
            (dimension value near 50) help the ticket, reflecting the standard
            political-science finding that balanced tickets outperform
            ideological ones.
          </li>
          <li>
            A <strong>qualitative bias</strong> (60% of the factor): the
            running mate's likeability, name recognition, and perceived
            competence, entered by the user as a −100 to +100 slider.
          </li>
        </ul>
        <p>
          The net factor is computed as{" "}
          <code>1 + combined × 0.05</code> and clamped to{" "}
          <code>[0.95, 1.05]</code>. The ±5% figure is chosen because observed
          Kenyan running-mate effects on national vote shares sit in the low
          single digits. It is not an arbitrary ceiling; it is a bound
          calibrated to the historical record.
        </p>

        <h2>7. The qualitative adjustment slider</h2>
        <p>
          One slider in the Variables panel captures factors that cannot be
          statistically verified: sympathy votes, ethnic and tribal voting,
          name recognition, and general like or dislike of a candidate. This
          slider is applied <strong>only to the incumbent candidate</strong>. A
          negative value represents an anti-incumbent mood; a positive value
          represents an incumbency advantage. Its effect is intentionally
          modest — the full −100 to +100 range produces roughly ±2 utility
          units, on the same scale as the other qualitative terms.
        </p>
        <p>
          Candidate-level and running-mate-level bias sliders work
          independently and are applied per candidate.
        </p>

        <h2>8. Live data behaviour</h2>
        <p>
          SwingMatrix fetches two classes of live data and is careful to
          describe what it does with each.
        </p>

        <h3>World Bank bootstrap</h3>
        <p>
          On app load, the four World Bank indicators are fetched in parallel.
          For each one, the latest non-null observation is taken and clamped to
          the slider's configured range. The slider is then updated{" "}
          <strong>only if the user has not already touched it</strong> — the
          check is that the current value matches the documented default within
          0.01. Sliders you have dragged keep your value; untouched sliders
          snap to the latest World Bank figure.
        </p>
        <p>
          Fetch status is surfaced in three places: the provenance footer shows
          a green dot with the observation year per indicator; the Variables
          panel shows a <em>Live · YYYY</em> badge on sliders that were
          successfully seeded from the API; and the World Bank response is
          cached in-memory for 24 hours so repeated page interactions do not
          generate repeated API calls.
        </p>
        <p>
          Failure is graceful. If the World Bank API is unreachable, the
          slider keeps its documented default, the provenance footer shows a
          red dot with an error tooltip, and the simulation continues normally.
        </p>

        <h3>GDELT news pulse</h3>
        <p>
          On first render of the results column, GDELT DOC 2.0 is queried for
          English-language Kenya political coverage from the last seven days.
          The response is cached for 15 minutes. Each returned headline is
          classified as <em>adverse</em> or <em>neutral</em> by matching against
          a pattern of terms including corruption, scandal, probe, arrest,
          crisis, protest, violence, sack, and related vocabulary. Headlines
          matching the pattern are marked with a red dot in the News pulse
          panel.
        </p>
        <p>
          A <strong>sentiment magnitude</strong> is computed from the fetched
          articles as:
        </p>
        <pre className="eq">
{`magnitude = (adverse articles / total articles)
          × min(1, total articles / 15)`}
        </pre>
        <p>
          This produces a value in <code>[0, 1]</code>. A quiet news week with
          no adverse coverage yields 0; wall-to-wall adverse coverage with 15
          or more articles yields 1. When the <em>Adverse news sentiment
          shock</em> toggle is enabled, the engine applies{" "}
          <code>−0.6 × magnitude</code> as a utility penalty to the incumbent
          candidate. The shock therefore scales with reality rather than being a
          fixed constant.
        </p>
        <p>
          The News pulse panel surfaces this transparently: it shows the
          adverse-to-total count, the computed magnitude, and the actual shock
          value that will be applied if the toggle is switched on. If GDELT is
          unreachable, the panel displays an error, magnitude stays at 0, and
          the toggle applies no penalty.
        </p>

        <h2>9. Rules and constraints</h2>
        <ul>
          <li>
            <strong>Minimum two candidates.</strong> A race with one candidate
            is not a simulation. The Remove button is disabled at two and a
            note explains why.
          </li>
          <li>
            <strong>Exactly one incumbent per seat.</strong> The checkbox is a
            radio input, so checking one candidate automatically unchecks any
            other. Re-checking the current incumbent clears the flag.
          </li>
          <li>
            <strong>Running mates only for President and Governor.</strong> The
            panel is hidden for other seats and the engine ignores any residual
            running-mate data on them.
          </li>
          <li>
            <strong>Seat changes reset candidates and shocks.</strong> Slider
            values are preserved across seat changes so a comparison across
            seats is possible without re-entering the environment.
          </li>
          <li>
            <strong>All computation is client-side.</strong> No data leaves the
            browser. Caching is in-memory only and is cleared on page refresh.
          </li>
        </ul>

        <h2>10. How to use SwingMatrix</h2>
        <p>
          The interface is arranged in three functional areas: the left column
          for inputs, the right column for candidate management and results, and
          the header for navigation between the simulator, this documentation,
          and the disclaimer. Read the steps below once, then explore.
        </p>

        <ol className="steps">
          <li>
            <strong>Choose a seat.</strong> Use the segmented control at the top
            of the left column. President and Governor show a small “RM” badge,
            indicating that running mates are available for those seats.
          </li>
          <li>
            <strong>Choose a scope.</strong> Open the county dropdown beneath
            the seat selector. Selecting <em>National (all counties)</em> scopes
            the simulation to the full register. Selecting a specific county
            scopes it to that county's registered voters, which is useful for
            reading, for example, how Nairobi would vote in a presidential race.
          </li>
          <li>
            <strong>Adjust the environment.</strong> Drag any slider in the
            Variables panel. Each slider is tagged with its World Bank
            indicator code; those backed by a live fetch also display a{" "}
            <em>Live · YYYY</em> badge showing the observation year currently in
            use. Changes are debounced by 30 ms, so a fast drag does not produce
            a backlog of computations.
          </li>
          <li>
            <strong>Toggle shocks.</strong> The Shocks panel contains four
            binary events — misinformation, incumbent corruption scandal,
            registration drive, and adverse news sentiment. Each is off by
            default. Turning one on applies the described effect to the current
            computation. The news-sentiment shock scales to the actual news
            volume, so its effect on any given day depends on real coverage.
          </li>
          <li>
            <strong>Read the News pulse.</strong> Above the sensitivity table
            the panel shows the latest Kenya political headlines with
            adverse-framing markers. Its summary row gives the adverse ratio,
            the computed magnitude, and the actual shock value. If the panel
            shows “Loading”, the engine has not yet received a magnitude and
            will treat the news effect as zero until the fetch resolves.
          </li>
          <li>
            <strong>Configure candidates.</strong> Each candidate card contains
            five policy-position sliders and an Incumbent radio. For the
            President and Governor seats a running-mate sub-panel appears below
            the positions. Use <em>Add candidate</em> to add up to any number of
            candidates; <em>Remove</em> becomes available when three or more are
            present.
          </li>
          <li>
            <strong>Read the chart.</strong> The right column shows each
            candidate's mean share with a whisker spanning the 10th to 90th
            percentile. The candidate rows jitter slightly on each render — this
            is the model's intrinsic variance, not a glitch.
          </li>
          <li>
            <strong>Read the sensitivity table.</strong> Below the chart, the
            engine ranks the six variables that move the leading candidate's
            share the most. A large value here is not a problem to fix — it is a
            signal about which assumption your result depends on most heavily.
          </li>
          <li>
            <strong>Check provenance.</strong> The footer of the results column
            lists the World Bank indicator codes in use, the year of each live
            observation, the active shocks, the number of Monte Carlo draws, and
            the current scope. Cite these when reporting a result.
          </li>
        </ol>

        <h2>11. Known limitations</h2>
        <ul>
          <li>
            <strong>Voter blocs are currently county-level.</strong> Constituency
            and ward subdivisions exist in the type contract but not in the
            computation. A national simulation therefore aggregates 47 bloc
            shares, not 1,450.
          </li>
          <li>
            <strong>Ideal points are uniform across blocs.</strong> Every bloc
            uses the same ideal of 50 on every dimension. Real electorates vary
            geographically, and subnational calibration using DHS data is the
            next planned improvement.
          </li>
          <li>
            <strong>No historical calibration.</strong> The salience weights
            have not yet been fit to 2022 results. They are set from principle
            and observed magnitudes, not regression.
          </li>
          <li>
            <strong>News sentiment is coarse.</strong> The adverse-framing
            classifier is a regular-expression pattern, not NLP-based sentiment
            analysis. It detects the presence of adverse vocabulary, not the
            direction or severity of sentiment. A headline that mentions
            “corruption” in a policy-reform context may be misclassified.
          </li>
          <li>
            <strong>Google News RSS is built but not yet wired.</strong> The
            client exists and is tested; the only news source currently feeding
            the UI is GDELT. A future version may merge both sources.
          </li>
          <li>
            <strong>Turnout is applied as a noise scale</strong>, not as a
            bloc-level propensity. A low-turnout environment widens the model's
            internal spread; it does not remove specific blocs from the
            aggregation.
          </li>
          <li>
            <strong>World Bank indicators are national.</strong> The API returns
            national series only. County-level demographic variation will
            require DHS subnational data, which is a planned extension.
          </li>
          <li>
            <strong>The corruption scandal toggle is single-dimension.</strong>{" "}
            It lowers the incumbent's Corruption position but does not also
            affect, for example, their perceived competence. A richer scandal
            model is possible but not built.
          </li>
        </ul>

        <p>
          These limitations are disclosed so that no user mistakes a simulation
          for a polling result. The engine will be improved, and this section
          will be updated as that happens. Until then, treat the outputs as what
          they are: conditional arithmetic under explicit assumptions.
        </p>
      </article>
    </>
  );
}
