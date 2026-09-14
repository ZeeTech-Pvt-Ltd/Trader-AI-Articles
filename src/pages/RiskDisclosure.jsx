import LegalPage from '../components/LegalPage.jsx'

// Template text - review with a lawyer before launch.
export default function RiskDisclosure() {
  return (
    <LegalPage title="Risk Disclosure" kicker="Legal" updated="September 8, 2026">
      <p>
        This disclosure applies to every page of Trader AI and to every platform
        we review. Read it before you act on anything you read here.
      </p>

      <h2>Trading and investing involve risk</h2>
      <p>
        Trading financial instruments - including cryptocurrencies, CFDs, forex, stocks and
        commodities - carries a high level of risk. Prices move quickly and against you.
        You can lose some or all of the money you deposit, and losses can exceed deposits
        where leverage is involved. Past performance, including any performance figures
        shown on reviewed platforms, is not a guarantee of future results.
      </p>

      <h2>Automation and AI claims</h2>
      <p>
        Platforms reviewed on this site commonly market “AI” engines, automated strategies
        and accuracy or win-rate figures. Such claims are typically self-published, rarely
        audited, and never a promise of profit. An automated system can lose money as
        efficiently as a manual one. Treat projected returns, calculators and community
        gain figures as marketing scenarios, not forecasts.
      </p>

      <h2>Regulatory status</h2>
      <p>
        Most platforms we review do not publish a licence or registration number on
        their public pages. An absence of published licensing details does not by itself
        prove a platform is unsafe - but it does mean regulatory protections such as
        compensation schemes may not apply to you. Verify a platform&rsquo;s regulatory
        status directly with the platform and with the relevant authority before
        depositing.
      </p>

      <h2>Our verdicts are not recommendations</h2>
      <p>
        A verdict of “safe - with conditions” is an editorial assessment of what a platform
        publishes. It is not a guarantee of safety, a licence, or an endorsement of any
        trade. Only invest money you can afford to lose, and consider independent
        professional advice for your circumstances.
      </p>
    </LegalPage>
  )
}
