# Claims and regulation
*Part of the [B2B2C research](/wiki/b2b2c). Sources: 34, from the notes in `docs/research/research_notes/Aurelia B2B2C models and plan/`.*

This page covers the legal and safety risks of selling an AI wellness programme through creators, employers and partners, in the EU, UK, US and Indonesia. It is not legal advice. Research was done on 2026-11-23. Items marked "primary text, not re-fetched" cite a well-known official document from its canonical address without retrieving it that day; check the current text before relying on it.

Labels used on this page: **(law)** is a statute or regulation in force. **(guidance)** is official regulator guidance. **(proposal)** is not yet law. **(enforcement)** is a regulator action or settlement. **(ruling)** is an advertising-regulator or court decision. **(commentary)** is a law-firm or press summary. **(estimate)** is our own inference.

## In one minute

- **What is said about the product decides whether it is a medical device.** In all four markets, wellness claims ("relaxation", "better everyday sleep") are fine; treating or preventing insomnia, anxiety or depression makes it a device. The UK regulator says a creator's social posts count.
- **The spec's "+85.7% sleep improvement" and "stress −50%" cannot be used anywhere.** Quantified health claims need trial-grade evidence held in advance. Aurelia's figures are invented mock data, so using them in real ads would be deceptive in itself.
- **Aurelia is responsible for what its creators say.** The US already holds brands liable for endorsers; the EU's proposed Digital Fairness Act would require brands to make influencers comply by contract.
- **A sentence about how someone feels is health data.** Give creators and employers only aggregate, de-identified numbers. Never put ad pixels on feeling or check-in screens.
- **A crisis protocol is now the baseline.** Users will type crisis content into the one-sentence box. Detect it, stop generation and show local crisis lines. Never call Aurelia "therapy": Illinois and Nevada fine it per violation.
- **EU AI Act transparency applies from 2 August 2026:** tell users they are dealing with AI and mark synthetic audio. Emotion inference in workplaces is banned.

## Wellness or medical device

In every market the line is drawn by **intended purpose as shown in claims, labelling and promotion, including social media**, not by the technology.

| Market | Rule | Date | Label | Source |
| --- | --- | --- | --- | --- |
| UK (MHRA) | "Digital mental health technology: qualification and classification" sets how intended purpose makes software a medical device | February 2025 (v1.3 read; a working group planned updates in February 2026) | guidance | [MHRA guidance PDF][mhra] |
| EU (MDR) | Software with a medical purpose (diagnosis, prevention, monitoring, treatment or alleviation of disease) is a device; Rule 11 puts most such software in class IIa or higher | MDCG 2019-11 (Rev 1) | guidance; primary text, not re-fetched | [MDCG 2019-11][mdcg] |
| US (FDA) | Revised "General Wellness" guidance supersedes the 2019 version; the two-part test (wellness-only, low risk) is unchanged. It is enforcement discretion, not a safe harbour | 2026-01-06 | guidance; commentary | [Covington][covington]; [Bloomberg Government][bgov] |
| Indonesia (Kemenkes) | KMK No. 951/2026 on software medical devices, including AI and LLMs: a device only with a medical purpose, judged on "function and product claims"; clinical and local validation required | Signed or effective 7 September or 1 October 2026 (sources differ) | law; commentary | [SIP Law Firm][sip] |

### The MHRA's worked examples

| Example intended purpose | MHRA view | Source |
| --- | --- | --- |
| "Supports treatment of poor sleep… only for well-being… sub-clinical levels" | Not a medical purpose | [MHRA guidance, §6.1.3][mhra] |
| Poor sleep "at sub-clinical or clinical levels as part of… insomnia disorder, major depressive disorder or generalised anxiety disorder" | Medical purpose | [MHRA guidance][mhra] |
| "Helps improve sleep and can prevent… depression and anxiety" | Medical purpose | [MHRA guidance][mhra] |
| "Reduces stress for those with epilepsy" (a group with a diagnosed condition) | Medical purpose | [MHRA guidance][mhra] |
| Website says "well-being" but social media implies it reduces depression risk, or GPs recommend it for moderate depression | Inferred medical purpose: regulate it as a device or remove the inferences | [MHRA guidance, Example 6][mhra] |

Other device signals for the MHRA (guidance): promotion that points to diagnosable conditions; PHQ-9 or GAD-7 questionnaires where users with any score keep using the product; use inside an NHS service; and a generative AI chatbot rated "high" functionality. [MHRA guidance][mhra]

In the US, "relaxation", "stress management" and "sleep management" have long been accepted wellness claims; "treats anxiety disorder" or "treats insomnia" are not (guidance; primary text, not re-fetched; confirm the 2026 wording). [FDA guidance page][fda]

**What this means for the retreat (estimate).** "Bad to good" is ambiguous. If a creator describes "bad" as anxiety, depression or insomnia, the MHRA's Example 2 and 6 logic applies. The protection is a wellness-only intended-purpose statement, an exclusion of people with diagnosed conditions, and control over creator copy. A creator's "philosophy" that steers the AI also shapes the product's function, so contracts must bar medical framing.

## EU AI Act

| Item | Date | Label | Source |
| --- | --- | --- | --- |
| Regulation (EU) 2024/1689 in force | 2024-08-01 | law; primary text, not re-fetched | [EUR-Lex][aiact] |
| Banned practices (Art. 5), incl. emotion inference in workplaces and education (except medical or safety reasons) and manipulation that exploits vulnerabilities | Since 2025-02-02 | law | [EUR-Lex][aiact] |
| Art. 50 transparency: tell users they are dealing with AI; mark synthetic audio and text in a machine-readable way | From 2026-08-02 | law | [EUR-Lex][aiact] |
| High-risk duties for AI in regulated products such as medical devices | Moved to 2027-12-02 (stand-alone) and 2028-08-02 (Annex I) by the Digital Omnibus | provisional agreement; status disputed (May 2026 "awaiting adoption", July 2026 "finalised") | [Gibson Dunn][gibson]; [Orrick][orrick] |

Aurelia's input is self-reported text, not biometric data, so it is probably not "emotion recognition" as the Act defines it (estimate). Adding wearable or voice-based emotion inference would change that, and would be **banned in an employer deployment** unless a medical or safety exception applies. Do not give employers individual mood data, and do not sell the product as a way to read staff wellbeing.

## Advertising and creator endorsements

| Market | Rule | Date | Label | Source |
| --- | --- | --- | --- | --- |
| US | Health claims need "competent and reliable scientific evidence", generally randomised human trials; specific-sounding claims such as percentages need that level | December 2022 | guidance; primary text, not re-fetched | [FTC Health Products Compliance Guidance][ftc-health] |
| US | Endorsement Guides: clear disclosure of paid relationships; advertisers liable for misleading endorser statements; AI influencers covered | Revised June 2023 | guidance; primary, not re-fetched | [FTC press release][ftc-endorse] |
| US | Consumer Reviews and Testimonials Rule bans fake or AI-generated reviews and testimonials; up to $53,088 per violation (December 2025) | Effective 2024-10-21 | law | [FTC press release][ftc-reviews]; [Venable][venable] |
| UK | CAP Code 12.1: objective health claims need evidence, including human trials where relevant. 12.2: no advice or treatment for conditions needing medical supervision | Current | self-regulatory code | [CAP Code][cap] |
| UK | ASA ruled against an AI mental-health app (Antipadia) for implying therapy for clinical conditions; it used the MHRA guidance to decide | Ruling date not checked | ruling | [ASA ruling, Antipadia][asa-antipadia] |
| UK | ASA ruled that an app's memory and **sleep** claims needed substantiation (Oakever Games) | Not dated in notes | ruling | [ASA ruling, Oakever][asa-oakever] |
| EU | Unfair Commercial Practices Directive bans undisclosed paid content, false cure claims and fake reviews | In force | law; primary, not re-fetched | [Influencer Legal Hub][influencer-hub] |
| EU | Digital Fairness Act: influencer marketing is a commercial practice; **brands must ensure "contractually or by other appropriate means" that influencers comply (Art. 11(6))**; express consent for trial-to-paid; fines reported up to 6% of turnover | Proposed about 11–13 November 2026 | proposal | [Lewis Silkin, 2026-11-11][lewis] |
| Indonesia | Advertising code requires disclosure of paid endorsements but is self-regulatory; no binding influencer statute found | Code amended 2014 | self-regulatory code | [Atlantis Press 2025][atlantis] |

**What this means (estimate).** The spec's "+85.7% sleep improvement" and "stress −50%" are unusable in all four markets without a trial of this product. Even with one, outcomes must stay in wellness terms ("stress", not "anxiety"). AI-generated "member stories" would breach the FTC rule and the EU directive.

## Health data

| Law or case | What it means | Date | Label | Source |
| --- | --- | --- | --- | --- |
| GDPR Art. 9, 26, 35 | Health data needs explicit consent (or another exception); joint controllers need an arrangement; large-scale processing needs a DPIA | In force | law; primary, not re-fetched | [GDPR, EUR-Lex][gdpr] |
| GoodRx | First Health Breach Notification Rule action: $1.5M penalty, ban on sharing health data for ads | February 2023 | enforcement | [IAPP][iapp] |
| BetterHelp | $7.8M for sharing mental-health questionnaire data with Facebook, Snapchat and others for ads | March 2023 | enforcement | [Fierce Healthcare][fierce-bh] |
| Cerebral | About $7M proposed order: data of about 3.2M people shared via pixels; refunds for cancellation practices; ban on using health data for most ads | April 2024 | enforcement | [FTC press release][ftc-cerebral] |
| Washington My Health My Data Act | Separate consents to collect and to share; private right of action; first class action filed 2025-02-10 | Effective 2024-03-31 | law | [WilmerHale][wilmerhale] |
| Indonesia PDP Law (UU 27/2022) | Health data is "specific personal data"; fines, criminal penalties, private right of action; implementing rules were pending | Full compliance from 2024-10-17 | law | [CMS][cms-pdp] |

**What changes when a creator or employer is a data partner (estimate):**

- A creator who receives identifiable buyer data (names, mood, progress) likely becomes a GDPR controller or joint controller. That needs an Art. 26 arrangement, explicit consent naming them and a DPIA, and in Washington a separate sharing consent. **Give creators only aggregate, de-identified sales and engagement numbers.**
- Employers: aggregate reporting only, with minimum group sizes. Employee consent is generally not "freely given" under GDPR.
- No Meta, TikTok or Google pixels or SDKs on screens that capture feelings or check-ins. That is the exact pattern in BetterHelp, GoodRx and Cerebral.

## Payments, marketplace and consumer rights

| Rule | Date | Label | Source |
| --- | --- | --- | --- |
| EU 14-day withdrawal right for digital content is lost only with prior express consent to start, an acknowledgement, and confirmation on a durable medium | Directive 2011/83/EU as amended | law; primary, not re-fetched | [EUR-Lex][crd] |
| EU VAT: a platform intervening in an e-service is generally presumed the supplier for VAT (Art. 9a, Regulation 282/2011) | In force | law; primary, not re-fetched | [EUR-Lex][vat9a] |
| Stripe Connect: destination charges make the platform the merchant of record (refunds, chargebacks); direct charges make the creator it | Current | company docs; not re-fetched | [Stripe Connect charges][stripe] |
| Digital Services Act: a platform loses its consumer-law liability shield if it presents an item so that consumers think it supplies it | Fully applicable since 2024-02-17 | law; primary, not re-fetched | [DSA, EUR-Lex][dsa] |

Aurelia's AI generates the sessions and its brand presents them, so it is unlikely to count as a mere host (estimate). Expect to be treated as the trader for consumer law, VAT and claims, and run refunds and withdrawal flows centrally. A one-off €19.99 ticket is simpler than a subscription; if anything auto-renews, US negative-option enforcement (Cerebral) and the proposed DFA apply. Fee and VAT figures are on [Unit economics](/wiki/b2b2c/economics).

## Safety and crisis handling

| Rule or event | Requirement | Date | Label | Source |
| --- | --- | --- | --- | --- |
| Illinois HB 1806 | AI may not provide therapy or make therapeutic decisions without a licensed professional; up to $10,000 per violation | Signed August 2025 | law | [TechTarget][techtarget] |
| Nevada AB 406 | No AI offering services that would be professional mental-health care, or claiming it can; up to $15,000 | 2025 | law | [DLA Piper][dla] |
| Utah HB 452 | "Mental health chatbots" must disclose AI, limit in-chat ads and limit sharing of health data | 2025 | law | [DLA Piper][dla] |
| California SB 243 (companion chatbots) | Disclose AI; a protocol for suicide and self-harm content with crisis referrals; protections for minors; annual reports from 2027-07-01 | Effective 2026-01-01 | law | [TechCrunch][tc-sb243] |
| Character.AI and Google | Agreed to settle teen-harm suits, including over a 14-year-old's suicide; terms undisclosed | About 2026-01-07 | settlement | [Bloomberg Law][bloomberg-cai] |
| UK MHRA | Adverse-event reporting work for digital mental-health technologies | 2025 | guidance | [MHRA AE report][mhra-ae] |

**Baseline for Aurelia (estimate, from SB 243 and the settlements):** detect self-harm signals in the input sentence; stop generation; show local crisis resources (988 in the US, Samaritans 116 123 in the UK, 112 or national lines in the EU, 119 ext. 8 in Indonesia); log for audit; gate by age; and never let a creator persona override safety behaviour. In the US neither Aurelia nor creators should use "therapy", "therapist", "treats anxiety" or "replaces your counsellor".

The NHS route (NICE, DTAC) is only relevant with a clinical claim, which would also make Aurelia a medical device (estimate). The wellness route and the NHS route are mutually exclusive. See [Employers and insurers](/wiki/b2b2c/employers).

## What this means for Aurelia

- **Write one wellness-only intended-purpose statement** and use it everywhere: app, site, creator brief, employer and partner decks.
- **Remove the spec's outcome percentages** from any material that could reach a buyer. They are mock data. Real outcome claims need a study of this product first.
- **Creator contract, before the first cohort:** approved claims only; Aurelia approval of all copy; mandatory paid-partnership disclosure; no medical or therapy framing; no recommending the retreat to patients; takedown on request; indemnity; audit rights. Monitor creators' posts: under the MHRA view and the FTC guides, their words become Aurelia's.
- **Exclude people with diagnosed conditions** from the retreat in the sign-up terms, and do not add PHQ-9 or GAD-7 scoring without routing clinical scores out.
- **Ship the crisis flow and the AI disclosure before selling a ticket.** Mark synthetic audio for EU users from 2 August 2026.
- **Data:** creators and employers see aggregates only; no ad pixels on feeling screens; a DPIA before launch in the EU.
- **Payments:** Aurelia as merchant of record, with a withdrawal-waiver step at checkout for EU buyers.
- The order in which to do this is on the [Plan](/wiki/b2b2c/plan); creator terms are discussed on [Creators and cohorts](/wiki/b2b2c/creators).

## Gaps

- The 2026 FDA guidance's examples were not retrieved; confirm "stress management" and "sleep" remain listed.
- KMK 951/2026's risk classes and any wellness exemption were not checked against the official text.
- The final AI Omnibus citation, and whether synthetic-audio watermarking got a grace period, were not confirmed.
- The Antipadia ruling date and full text were not checked. No ASA or FTC action on "% improvement" claims by a meditation or sleep app was found.
- Indonesia: the online-advertising disclosure rule, the PDP supervisory agency and implementing regulation, and AI mental-health chatbot rules were not confirmed. The PDP Law's maximum fine is not sourced.
- Whether Utah's and Nevada's definitions cover a non-conversational session generator was not checked.
- The status of the US "click-to-cancel" rule, Stripe support for Indonesian creators, and case law on platform liability for an influencer's health claims were not researched.
- **Before quoting:** treat every "primary text, not re-fetched" row as needing a check, and the DFA as a proposal.

## What a creator may and may not say

For Aurelia's 8-week retreat. When in doubt, the creator sends the copy to Aurelia first.

| Topic | Do say | Do not say | Why |
| --- | --- | --- | --- |
| What it is | "An 8-week guided wellness programme with AI-generated sessions" | "Therapy", "treatment", "a therapist in your pocket", "replaces your counsellor" | Therapy claims bring medical-device rules and, in Illinois and Nevada, per-violation fines ([MHRA][mhra]; [TechTarget][techtarget]) |
| Who it is for | "For everyday stress and busy minds" | "For anxiety, depression or insomnia"; "for people with [any diagnosis]" | Naming a condition or a diagnosed group is a medical purpose ([MHRA][mhra]) |
| Sleep | "Sessions to help you wind down at night" | "Cures insomnia"; "+85.7% better sleep" | Disease and quantified claims need trial evidence ([FTC][ftc-health]; [ASA, Oakever][asa-oakever]) |
| Stress | "Practices for relaxation and managing everyday stress" | "Cuts stress by 50%"; "treats anxiety" | Percentages need substantiation; anxiety is a medical claim ([CAP Code][cap]) |
| Results | "What I noticed in my own practice" (true and typical) | Invented figures, the spec's mock statistics, or AI-written "member stories" | Fake or AI testimonials are banned ([FTC reviews rule][ftc-reviews]) |
| Prevention | "Building a calming habit" | "Prevents depression"; "stops burnout becoming illness" | Prevention of a condition is a medical purpose ([MHRA][mhra]) |
| Paid relationship | "#ad" or "Paid partnership with Aurelia", clearly visible | Presenting it as an independent recommendation | Disclosure is required, and Aurelia is liable ([FTC endorsements][ftc-endorse]; [Lewis Silkin][lewis]) |
| AI | "Your sessions are generated by AI, guided by my approach" | Implying the creator records or writes each session personally, or that a human is listening | AI disclosure duties ([EUR-Lex][aiact]; [TechCrunch][tc-sb243]) |
| Crisis | "If you are in crisis, contact your local emergency line" | "Use this instead of getting help" | Must not discourage essential treatment ([CAP Code][cap]) |
| Health professionals | "Talk to your doctor if you are worried about your health" | "Recommended by doctors"; asking clinicians to prescribe it | Clinician recommendation implies a medical purpose ([MHRA][mhra]) |
| Data | "Aurelia shares only overall numbers with me" | Asking buyers to share mood details with the creator, or promising personal feedback from data | Health data shared with partners needs separate consent ([GDPR][gdpr]; [WilmerHale][wilmerhale]) |

## Sources

1. [MHRA: Digital mental health technology guidance (PDF v1.3)](https://assets.publishing.service.gov.uk/media/6866572fadfe29730ea3a9d5/MHRA_guidance_on_DMHT_-_Device_characterisation_regulatory_qualification_and_classification.pdf)
2. [European Commission: MDCG 2019-11 software qualification and classification](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_qualification_classification_software_en_0.pdf)
3. [Covington: FDA revised guidance on general wellness products (January 2026)](https://cov.com/en/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products)
4. [Bloomberg Government: FDA eases wellness device regulation, marketing still key](https://news.bgov.com/safety/fda-eases-wellness-device-regulation-but-marketing-is-still-key)
5. [SIP Law Firm: Kepmenkes 951/2026 on software medical devices](https://siplawfirm.id/id/publikasi/alat-kesehatan-berbasis-software-kepmenkes-951-2026)
6. [FDA: General Wellness: Policy for Low Risk Devices](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices)
7. [EUR-Lex: Regulation (EU) 2024/1689, the AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
8. [Gibson Dunn: EU AI Act Omnibus agreement (May 2026)](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement)
9. [Orrick: Digital Omnibus finalises compliance changes (July 2026)](https://www.orrick.com/ja-JP/Insights/2026/07/EU-AI-Act-Update-Digital-Omnibus-Finalizes-8-Compliance-Changes)
10. [FTC: Health Products Compliance Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance)
11. [FTC: updated Endorsement Guides (June 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements)
12. [FTC: final rule banning fake reviews and testimonials (August 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)
13. [Venable: FTC signals enforcement of the reviews rule (December 2025)](https://www.venable.com/insights/publications/2025/12/ftc-signals-heightened-enforcement-of-new)
14. [ASA: The CAP Code](https://www.asa.org.uk/static/c6be0fb9-2c66-4248-ba5b824bf26fd3d3/fa3714eb-f3e9-4c45-b9d31f1b87d00d3a/The-CAP-Code.pdf)
15. [ASA ruling: Antipadia Enterprises Ltd](https://www.asa.org.uk/rulings/antipadia-enterprises-ltd.html)
16. [ASA ruling: Oakever Games Pte Ltd](https://www.asa.org.uk/rulings/oakever-games-pte-ltd-g24-1257433-oakever-games-pte-ltd.html)
17. [European Commission: Influencer Legal Hub](https://commission.europa.eu/business-economy-euro/product-safety-and-requirements/consumer-protection/influencer-legal-hub_en)
18. [Lewis Silkin: Commission publishes the Digital Fairness Act (2026-11-11)](https://www.lewissilkin.com/insights/2026/11/11/european-commission-publishes-long-awaited-digital-fairness-act-102o9b5)
19. [Atlantis Press: INCLAR 2025 proceedings on Indonesian influencer rules](https://download.atlantis-press.com/proceedings/inclar-25/126018236)
20. [EUR-Lex: GDPR, Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
21. [IAPP: FTC $1.5M Health Breach Notification Rule penalty (GoodRx)](https://iapp.org/news/b/ftc-proposes-1-5m-fine-for-violation-of-health-breach-notification-rule)
22. [Fierce Healthcare: BetterHelp to pay $7.8M](https://www.fiercehealthcare.com/health-tech/teladoc-owned-betterhelp-pay-78m-users-alleged-data-misuse-ftc-order)
23. [FTC: proposed order against Cerebral (April 2024)](https://ftc.gov/news-events/news/press-releases/2024/04/proposed-ftc-order-will-prohibit-telehealth-firm-cerebral-using-or-disclosing-sensitive-data)
24. [WilmerHale: first lawsuit under Washington's My Health My Data Act](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20250220-first-lawsuit-filed-under-washingtons-my-health-my-data-act)
25. [CMS: compliance with Indonesia's PDP Law by October 2024](https://cms.law/en/int/legal-updates/compliance-with-indonesia-s-personal-data-protection-law-by-october-2024)
26. [EUR-Lex: Consumer Rights Directive 2011/83/EU (consolidated)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011L0083-20220528)
27. [EUR-Lex: Implementing Regulation 282/2011 (VAT)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011R0282-20250101)
28. [Stripe: Connect charge types](https://docs.stripe.com/connect/charges)
29. [EUR-Lex: Digital Services Act, Regulation (EU) 2022/2065](https://eur-lex.europa.eu/eli/reg/2022/2065/oj)
30. [TechTarget: Illinois bans AI in mental healthcare](https://www.techtarget.com/healthtechanalytics/news/366628773/Illinois-1st-US-state-to-ban-AI-in-mental-healthcare)
31. [DLA Piper: AI mental health chatbots (August 2025)](https://www.dlapiper.com/en-ca/insights/publications/2025/08/ai-mental-health-chatbots)
32. [TechCrunch: California regulates AI companion chatbots (2025-10-13)](https://techcrunch.com/2025/10/13/california-becomes-first-state-to-regulate-ai-companion-chatbots)
33. [Bloomberg Law: Character.AI and Google agree to settle teen chatbot harm suits](https://news.bloomberglaw.com/litigation/character-ai-google-agree-to-settle-teen-chatbot-harm-lawsuits)
34. [MHRA: report on adverse-event reporting in digital mental health technologies](https://www.gov.uk/government/publications/report-on-adverse-event-ae-reporting-in-digital-mental-health-technologies-dmhts-and-the-development-of-updates-to-regulatory-guidance/report-on-adverse-event-ae-reporting-in-digital-mental-health-technologies-dmhts-and-the-development-of-updates-to-regulatory-guidance)

[mhra]: https://assets.publishing.service.gov.uk/media/6866572fadfe29730ea3a9d5/MHRA_guidance_on_DMHT_-_Device_characterisation_regulatory_qualification_and_classification.pdf
[mdcg]: https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_qualification_classification_software_en_0.pdf
[covington]: https://cov.com/en/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products
[bgov]: https://news.bgov.com/safety/fda-eases-wellness-device-regulation-but-marketing-is-still-key
[sip]: https://siplawfirm.id/id/publikasi/alat-kesehatan-berbasis-software-kepmenkes-951-2026
[fda]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
[aiact]: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
[gibson]: https://www.gibsondunn.com/eu-ai-act-omnibus-agreement
[orrick]: https://www.orrick.com/ja-JP/Insights/2026/07/EU-AI-Act-Update-Digital-Omnibus-Finalizes-8-Compliance-Changes
[ftc-health]: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
[ftc-endorse]: https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements
[ftc-reviews]: https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials
[venable]: https://www.venable.com/insights/publications/2025/12/ftc-signals-heightened-enforcement-of-new
[cap]: https://www.asa.org.uk/static/c6be0fb9-2c66-4248-ba5b824bf26fd3d3/fa3714eb-f3e9-4c45-b9d31f1b87d00d3a/The-CAP-Code.pdf
[asa-antipadia]: https://www.asa.org.uk/rulings/antipadia-enterprises-ltd.html
[asa-oakever]: https://www.asa.org.uk/rulings/oakever-games-pte-ltd-g24-1257433-oakever-games-pte-ltd.html
[influencer-hub]: https://commission.europa.eu/business-economy-euro/product-safety-and-requirements/consumer-protection/influencer-legal-hub_en
[lewis]: https://www.lewissilkin.com/insights/2026/11/11/european-commission-publishes-long-awaited-digital-fairness-act-102o9b5
[atlantis]: https://download.atlantis-press.com/proceedings/inclar-25/126018236
[gdpr]: https://eur-lex.europa.eu/eli/reg/2016/679/oj
[iapp]: https://iapp.org/news/b/ftc-proposes-1-5m-fine-for-violation-of-health-breach-notification-rule
[fierce-bh]: https://www.fiercehealthcare.com/health-tech/teladoc-owned-betterhelp-pay-78m-users-alleged-data-misuse-ftc-order
[ftc-cerebral]: https://ftc.gov/news-events/news/press-releases/2024/04/proposed-ftc-order-will-prohibit-telehealth-firm-cerebral-using-or-disclosing-sensitive-data
[wilmerhale]: https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20250220-first-lawsuit-filed-under-washingtons-my-health-my-data-act
[cms-pdp]: https://cms.law/en/int/legal-updates/compliance-with-indonesia-s-personal-data-protection-law-by-october-2024
[crd]: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011L0083-20220528
[vat9a]: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011R0282-20250101
[stripe]: https://docs.stripe.com/connect/charges
[dsa]: https://eur-lex.europa.eu/eli/reg/2022/2065/oj
[techtarget]: https://www.techtarget.com/healthtechanalytics/news/366628773/Illinois-1st-US-state-to-ban-AI-in-mental-healthcare
[dla]: https://www.dlapiper.com/en-ca/insights/publications/2025/08/ai-mental-health-chatbots
[tc-sb243]: https://techcrunch.com/2025/10/13/california-becomes-first-state-to-regulate-ai-companion-chatbots
[bloomberg-cai]: https://news.bloomberglaw.com/litigation/character-ai-google-agree-to-settle-teen-chatbot-harm-lawsuits
[mhra-ae]: https://www.gov.uk/government/publications/report-on-adverse-event-ae-reporting-in-digital-mental-health-technologies-dmhts-and-the-development-of-updates-to-regulatory-guidance/report-on-adverse-event-ae-reporting-in-digital-mental-health-technologies-dmhts-and-the-development-of-updates-to-regulatory-guidance
