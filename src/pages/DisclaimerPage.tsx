const styles = `
.page {
  max-width: 720px;
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
}
.page p {
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: var(--sp-4);
  font-size: var(--fs-base);
}
.page p strong { color: var(--text-primary); font-weight: 600; }
.page ul {
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: var(--sp-4);
  padding-left: var(--sp-5);
}
.page li { margin-bottom: var(--sp-2); }
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
.page__closing {
  margin-top: var(--sp-6);
  padding: var(--sp-4) var(--sp-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--accent-primary);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  color: var(--text-primary);
  line-height: 1.6;
}
`;

export function DisclaimerPage() {
  return (
    <>
      <style>{styles}</style>
      <article className="page">
        <span className="page__meta">Position Statement</span>
        <h1>On the limits of SwingMatrix</h1>
        <p className="page__lede">
          SwingMatrix is a simulation engine. It does not forecast elections.
          Understanding the difference is essential to using it responsibly.
        </p>

        <p>
          SwingMatrix takes a set of user-defined assumptions — demographic
          conditions, economic indicators, information shocks, and candidate
          attributes — and computes how a hypothetical electorate would
          distribute its vote under those conditions. That is the whole of what
          it does.
        </p>

        <p>
          The distinction between simulating and forecasting is not semantic. It
          is the difference between arithmetic and prophecy.
        </p>

        <p>
          An election forecast claims something about the future: given what we
          know today, we expect a particular candidate to receive a particular
          share of the vote. It is a statement that can be wrong, and in most
          electoral cycles it has been. A simulation makes a different sort of
          claim entirely: if the electorate looked like <em>this</em>, the vote
          distribution would look like <em>that</em>. The claim is conditional,
          and it is exactly as sound as the assumptions behind it.
        </p>

        <p>
          Every number SwingMatrix produces is conditional on what you have
          placed into its inputs. If you raise youth unemployment to thirty per
          cent and toggle a corruption scandal, the engine will compute a
          specific outcome. That outcome is arithmetically correct and it is
          also entirely fictitious, because neither of those conditions is real.
          The engine is not deceiving you. It is faithfully simulating a world
          you described. But that world is not the current one.
        </p>

        <p>
          This is the entire design. SwingMatrix is a thinking tool, not an
          oracle. Its purpose is to let a user ask: how much would this variable
          have to move before the outcome changes? Which groups are most
          sensitive to which shocks? Does the incumbent survive a bad quarter,
          and if so, by how much? These are questions about structure, and they
          are answerable by simulation. The question <em>who will win</em> is not
          one of them.
        </p>

        <h2>What the numbers mean</h2>

        <ul>
          <li>
            A bar reading <strong>42%</strong> means that, under your current
            inputs, the candidate receives 42% of the modelled vote. It does not
            mean they are likely to receive 42% in reality.
          </li>
          <li>
            The <strong>10th–90th percentile band</strong> reflects the
            engine's internal randomness — the Gumbel shock that keeps the model
            honest. It is not a confidence interval about the real election.
          </li>
          <li>
            The <strong>sensitivity ranking</strong> tells you which of your
            inputs is doing the most work. If a single slider can shift the
            leader's share by ten points, that is a reason to interrogate that
            slider, not a reason to trust the leader's number.
          </li>
        </ul>

        <h2>Who SwingMatrix is for</h2>

        <p>
          Political commentators use it to test narratives before they publish
          them. Does the government's claim that poverty is falling translate
          into a vote gain? Under what assumptions does that story hold? The
          simulator forces those questions into the open.
        </p>

        <p>
          Politicians use it to think about strategy. Which constituency is most
          sensitive to a welfare promise? How much does a running mate need to
          move the dial to change a region's arithmetic? The outputs are not
          polling data and should never be reported as such.
        </p>

        <p>
          Students use it to learn how spatial models work. The spatial-voting
          equation is a standard in political science, and SwingMatrix
          implements it without abridgement. Manipulating the inputs is the
          fastest way to build intuition for what the equation actually does.
        </p>

        <p>
          The engine is built to be inspectable. Every indicator is a public
          World Bank series. Every shock is named and documented. Every
          computation method is described in the documentation. If a number
          surprises you, the path to its derivation is open.
        </p>

        <h2>What SwingMatrix is not</h2>

        <ul>
          <li>
            <strong>Not a poll.</strong> No real voters were surveyed. No
            sampling frame exists.
          </li>
          <li>
            <strong>Not a forecast.</strong> It does not claim to know who will
            win.
          </li>
          <li>
            <strong>Not a policy endorsement.</strong> A candidate performing
            well in the simulation is not a claim that the candidate is good.
          </li>
          <li>
            <strong>Not a substitute</strong> for on-the-ground reporting,
            polling, or scholarship.
          </li>
        </ul>

        <h2>How to cite a result</h2>

        <p>
          Use it carefully. Cite the inputs, not the outputs. Report the
          assumptions alongside the share. And when a simulation result is
          quoted in public, quote the conditional it depends on.
        </p>

        <div className="page__closing">
          SwingMatrix is a tool for thinking. Treat it that way.
        </div>
      </article>
    </>
  );
}
