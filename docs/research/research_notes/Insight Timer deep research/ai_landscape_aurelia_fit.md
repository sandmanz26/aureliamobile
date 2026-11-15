# Insight Timer vs Aurelia, and the AI-personalised wellness audio landscape (as of 15 Nov 2026)

Scope note: public sources only, retrieved 2026-11-15. Each heading has Facts (Cited Findings) kept apart from Analysis (Inferences), which covers fit with Aurelia. Aurelia facts come from the internal brief and are not sourced. Several sources are affiliate or review sites, and they are flagged where used. About 18 search/fetch calls were made, so coverage is broad but not exhaustive.

## 1. Insight Timer's "Map of Healing": how it works, when it launched, what it powers, and how close it is to a causal personalisation graph

### Takeaway
The Map of Healing is a layered knowledge map (person × practice × science) that links practices to mechanisms, biomarkers/body changes, benefits and people. Teachers, therapists and members contribute to it. It is explicitly a count of documented connections, not an evidence-strength or causal model. No public source says what in the product it powers, and none gives a launch date. Structurally it is the closest thing in the market to Aurelia's Wellness State Graph, but it is applied to discovery and to curating human-made content rather than to generating sessions.

### Cited Findings
- insighttimer.com/science calls it "The Map of Healing". It is three stacked maps (a map of the person, a map of the practice, a map of the science), with links that run practices → mechanisms → changes in the body → the people they help — [Insight Timer, The Map of Healing](https://insighttimer.com/science) (page © 2026, no publication date)
- The page names "22 individual rings" but describes eight: Meaning Systems, Practices, Mechanisms, Biomarkers, Benefits, Lived Experiences, Personal Attributes, Learning Preferences. It says the map "holds billions of pathways". Teachers, therapists and members contribute — [Insight Timer science page](https://insighttimer.com/science), fetched 2026-11-15
- Scale: a search-engine snippet of the same page read "links 933 practices to 75 mechanisms, 340 changes in the body and 131 conditions", drawing on about 250,000 research papers — [Insight Timer science page (search snippet)](https://insighttimer.com/science). **Conflict:** the page as fetched on 2026-11-15 showed no counts (possibly rendered dynamically), so treat these figures as unverified.
- Evidence tagging: "every link is a count of documented connections, never a claim of evidence strength". Elsewhere the Benefits ring says "the strength of evidence is assessed for each claim", and practices are considered for "evidence of efficacy", but the page does not explain how either is done. Mechanisms are described as processes that "explain how a technique works", which is causal language set against otherwise correlational hedging — [Insight Timer science page](https://insighttimer.com/science)
- The About page says the company "started as a meditation timer in 2009. Today our Map of Healing gives us new ways to study how different healing practices affect the body and mind" — [About Insight Timer](https://insighttimer.com/about)
- The App Store listing promotes "MAJOR UPDATE The Map of Healing" — [Insight Timer, US App Store](https://apps.apple.com/us/app/insight-timer-meditate-sleep/id337472899) (listing undated in the snippet)
- CEO Christopher Plowman presented the map at Transform Trauma Oxford. In that talk he described an "arc of decay" ("First civility, then attention, then truth, now our institutions") and said that what settles one person does nothing for the next. He framed the map as placing contemplative practices (prayer, chanting, breathwork, body scans) alongside what published research says about them — [blog repost of the talk description, 2026-11-05](https://consistencyofchange.wordpress.com/2026/11/05/so-this-is-something-i-wouldve-posted-on-fb-insighttimer-ceo-speaks-up/) (secondary source; talk date not given)
- On what it powers, the science page links out to Teachers, Therapists, Topics, Courses, Playlists, Live Events, Retreats and Challenges but never says the map drives them — [Insight Timer science page](https://insighttimer.com/science). Separately, Insight Timer's AI safety page says its AI "surfaces the most relevant of Insight Timer's 20,000 teachers" for content, live sessions and in-person retreats — [Insight Timer AI safety](https://insighttimer.com/ai-safety) (last updated 2025-07-23)
- Its January 2026 "AI recommendation engine" reads each user's daily intention and suggests matching content from a library of more than 300,000 tracks. The company cites more than 32 million members — [GlobeNewswire via Manila Times, 2026-01-06](https://www.manilatimes.net/2026/01/06/tmt-newswire/globenewswire/insight-timer-launches-new-years-resolution-and-intention-setting-features-with-ai-recommendation-engine/2253735); [Yahoo Finance copy](https://finance.yahoo.com/news/insight-timer-launches-resolution-intention-133700660.html)

### Inferences (analysis)
- The likeliest use is a substrate for recommendation, teacher/therapist matching and science communication. The Personal Attributes and Learning Preferences rings, plus "what settles one person does nothing for the next", point to person-level matching, but this is inferred, not stated.
- Against Aurelia's Wellness State Graph (~4,000 nodes, ~120,000 weighted links, with a per-person feedback loop): both are typed graphs linking technique → mechanism → outcome → person. The differences:
  1. Insight Timer's links are literature co-occurrence counts with no evidence weight. Aurelia's links are weighted and meant to be updated from each person's outcomes.
  2. Insight Timer's graph routes people to existing human recordings. Aurelia's routes to script elements that are assembled into new audio.
  3. No public evidence shows Insight Timer closing the loop with individual outcome data (check-ins, biomarkers) to learn what helps a specific person. That loop is Aurelia's claimed edge.
- Threat: Insight Timer already has the vocabulary ("mechanisms", "biomarkers", "pathways"), a science page and 32M+ members. If it adds outcome feedback to the map, it gets a causal-personalisation story with a far larger library and a free tier. Aurelia should not lead its marketing with "a science graph" alone, because Insight Timer can claim that too. The defensible claim is "learns what works for you, and builds it".
- Opportunity: Insight Timer's own disclaimer ("never a claim of evidence strength") leaves room for Aurelia to show per-person evidence ("this change helped you 4 of 5 nights"), which a co-occurrence map cannot.

### Gaps
- No launch date found for the Map of Healing (no newsroom post or press release surfaced). The App Store "major update" note suggests 2026, but this is unconfirmed.
- The counts (933/75/340/131, ~250k papers) appear only in a snippet. The methodology (NLP over papers? manual curation?) is not described.
- No source confirms that the map currently drives recommendations, Reflect, or therapist matching.

## 2. Insight Timer's stance on AI: "No AI" marketing vs AI features and teacher policy

### Takeaway
Insight Timer runs a deliberate split. The content is "No AI": human-made recordings, AI narration rejected, AI music only as a bed under a human voice. The product, meanwhile, increasingly uses AI: the Reflect chatbot, an AI recommendation engine for intentions (Jan 2026), and AI teacher-surfacing. The CEO frames "No AI" as an antidote to "AI slop". This makes Insight Timer the most explicit "human-made" counter-positioning to an AI-generated product like Aurelia.

### Cited Findings
- Library tagline: "the largest free library in the world. Free. No Ads. No AI." Its new video product is likewise described as having no ads and no AI. Plowman has said YouTube is "increasingly drowning in AI slop and noise" — [search summary of Insight Timer/LinkedIn posts](https://insighttimer.com/about) (primarily LinkedIn reposts; no official policy document found)
- In the American Counseling Association Strategic Partner Network announcement, Insight Timer is described as having no ads and no AI-generated content, with every recording made by a real practitioner — [Newswise, 2026-07-21](https://www.newswise.com/articles/american-counseling-association-adds-insight-timer-to-prestigious-strategic-partner-network)
- Teacher AI policy (help centre): "We support limited, transparent use of AI that preserves genuine human creation." AI-generated music is allowed only as background under a human voice track, and music-only tracks "must be genuine, non-AI music". AI images are acceptable if they meet the image requirements without significant distortions. AI tools are allowed for quality fixes such as noise reduction — [Insight Timer Help: Can teachers use AI on their offerings?](https://insight-timer.freshdesk.com/support/solutions/articles/67000723124-can-teachers-use-artificial-intelligence-ai-on-their-insight-timer-offerings-) (undated)
- The video guidelines list "use of AI narration" as a reason a submission can be rejected — [Insight Timer Help: Video guidelines for teachers](https://insight-timer.freshdesk.com/support/solutions/articles/67000750966-video-guidelines-for-teachers)
- Reflect is an "AI-powered conversation partner" that offers reflective questions, not advice or therapy. It "does not diagnose, treat, cure or prevent mental illness". It points to crisis lines (US 988, AU 13 11 14, UK/ROI 116 123). Chats are stored, deletable and never shared, and anonymised chats may be used to improve Reflect unless the user opts out. Insight Timer says it does not train AI models on user data. The model provider is not named. A SOC 2 Type II audit was "in progress (target Q4 2025)". Page last updated 2025-07-23 — [Insight Timer AI safety](https://insighttimer.com/ai-safety)
- The Terms of Service mention "clearer rules around both User Submissions and AI-generated content in connection with our new Reflect chatbot feature" — [Insight Timer Terms of Service](https://insighttimer.com/terms-of-service) (full rules not retrieved)
- 2026-01-06: AI-powered intention-setting and New Year's resolution features, using "proprietary AI" to match daily intentions to content, with Plowman quoted on connecting long-term goals and daily intentions — [GlobeNewswire via Manila Times](https://www.manilatimes.net/2026/01/06/tmt-newswire/globenewswire/insight-timer-launches-new-years-resolution-and-intention-setting-features-with-ai-recommendation-engine/2253735) (the Insight Timer blog copy now returns 404)

### Inferences (analysis)
- Insight Timer's line is "AI may choose; AI may not speak". That is a coherent brand position, and it will be used, explicitly or implicitly, against generated sessions ("real teachers, not synthetic voices"). Its ACA partnership adds counsellor-facing credibility to the human-made claim.
- For Aurelia, this is the sharpest framing threat. Aurelia should expect "AI slop" objections and pre-empt them with transparency (labelled AI voice, cited techniques, human-authored script elements in the graph) and with craft quality.
- Opportunity: Insight Timer's stance means it will not produce a session made for one specific moment. "Your sentence, your session" is a gap it has chosen not to fill. A possible bridge is human teacher-authored modules recombined by AI, though Insight Timer's teacher policy suggests its community would resist this.
- Reflect plus the intention recommender plus the Map of Healing make up the ingredients of an Aurelia-like loop (state in, matched practice out). The missing piece is generation.

### Gaps
- No evidence found of "AI-designed programmes" or AI video at Insight Timer. The video product is marketed as no-AI. A sanctioned AI video initiative may exist but did not surface.
- No Reflect launch date (the safety page dates from July 2025; Reflect presumably launched around mid-2025).
- No long-form leadership interview on AI strategy found. Plowman quotes come from LinkedIn and a talk repost.

## 3. AI-personalised meditation, sleep and mental-wellness competitors and their traction

### Takeaway
The incumbents are using AI for chat and triage (Headspace Ebb) or recommendations (Calm), not for generating sessions. Headspace is being absorbed by an AI health company (Sword, up to ~$300M, 2026). Sword's purchase and Woebot's consumer exit (2025) show AI mental health consolidating into clinical/enterprise channels. AI-native consumer players are small: Rosebud raised a $6M seed, and Endel's last disclosed round was $5M in 2020. Fully generated meditation apps are mostly small or unfunded. Funding for meditation apps overall is thin (Tracxn, low eight figures in 2026 YTD).

### Cited Findings
**Headspace / Sword**
- Ebb is an "empathetic AI companion" trained in motivational interviewing and built by clinical psychologists and data scientists. In May 2025 it anchored a "stratified care model" for organisations. Headspace reported 34% higher engagement among regular Ebb users — [Business Wire, 2025-05-21](https://www.businesswire.com/news/home/20250521958749/en/Headspace-Unveils-Stratified-Care-Model-Powered-by-Empathetic-AI-Companion-Ebb); [Headspace for Organizations blog](https://organizations.headspace.com/blog/transforming-workforce-mental-health-with-our-new-ai-powered-stratified-care-model)
- Ebb was extended to UK members — [Headspace article](https://www.headspace.com/articles/headspace-brings-empathetic-ai-companion-ebb-to-uk-members)
- Reviews report a voice mode (December 2025 update) and memory of past conversations, and note no peer-reviewed publications on Ebb — [Stella Labs review 2026](https://www.stellalabs.ai/blog/headspace-ebb-review-2026); [ai-health-apps.com review](https://ai-health-apps.com/reviews/headspace-review/) (review/affiliate sites)
- Sword Health is acquiring Headspace's parent in an all-cash deal reported at up to $300M. A regulatory filing was first reported 2025-08-25, and it was reported as acquired around 2026-09-16. Sword plans to integrate AI for earlier need detection and clinician routing, plus its MindEval/MindGuard safety frameworks. Headspace has 15,000+ clinical providers. Sword previously bought Kaia Health for $285M — [STAT, 2026-08-25](https://www.statnews.com/2026/08/25/sword-health-to-acquire-headspace-per-regulatory-filing/); [Bloomberg, 2026-09-16](https://www.bloomberg.com/news/articles/2026-09-16/headspace-meditation-app-being-acquired-by-ai-startup-sword-for-300-million); [MobiHealthNews](https://www.mobihealthnews.com/news/sword-health-acquire-headspace-all-cash-deal); [pharmaphorum](https://pharmaphorum.com/news/sword-health-buys-headspace-200m-300m-deal). Closing status differs between sources.

**Calm**
- No reliable evidence that Calm generates personalised content with AI. Sleep Stories remain human/celebrity-narrated. Personalisation is described as recommendation ("decides what to show you, not what to say to you"). The Calm Sleep app offers a personalised sleep plan, with Premium at $69.99/yr — [TechCrunch on Calm Sleep](https://techcrunch.com/?p=3045822); [inthemoment.app comparison](https://inthemoment.app/articles/calm-vs-headspace); [marlvel.ai report, Apr 2026](https://marlvel.ai/intel-report/health-fitness/calm) (low-authority review sites for the "basic collaborative filtering" claim)

**Woebot**
- The consumer app shut on 2025-06-30. Founder Alison Darcy attributed this largely to the cost of FDA marketing authorisation and to LLMs "that the FDA hasn't yet figured out how to regulate". The company continues as an enterprise/health-system partner — [STAT, 2025-07-02](https://www.statnews.com/2025/07/02/woebot-therapy-chatbot-shuts-down-founder-says-ai-moving-faster-than-regulators/)

**AI-native consumer apps**
- Rosebud (AI journaling): $6M seed led by Bessemer, June 2025 (Tracxn says April 2025). App Store premium plans run $12.99–$99.99. Higher "Thrive" tiers are reported at $24.99/mo and $59.99/mo, and the free plan was reportedly retired 2026-09-30 — [Tracxn Rosebud](https://tracxn.com/d/companies/rosebud/__DfpfuP8cDF1J-2wamjOjTCTvCSyjq8cJ94sVOESiOUg); [medaiverdict Rosebud](https://medaiverdict.com/tools/rosebud); [ixcoach review](https://www.ixcoach.com/learn/rosebud-journal-ai-review-2026). One aggregator reports ~7.5K paying customers, graded "evidence D" — [Aiolum](https://aiolum.com/story/rosebud/) (weak)
- Endel (adaptive generative soundscapes): $5M round led by Kevin Rose in 2020. A Sept 2026 US App Store snapshot showed monthly prices of $2.99/$7.49/$19.99, yearly prices of $34.99–$119.99 and a lifetime option at $124.99 — [Wikipedia: Endel](https://en.wikipedia.org/wiki/Endel_(app)); [slonoise Endel review](https://slonoise.com/resources/endel-review/)
- Stoic: morning/evening routines with an optional AI add-on and a free basic tier — [Medium roundup](https://medium.com/macoclock/5-self-improvements-apps-in-2025-and-how-you-should-be-using-them-4155d2fa0c0b) (weak)
- Generated-sleep-story apps such as CalmAlma (unrelated to Calm) market "advanced generative AI" tailoring — [Product Hunt: CalmAlma](https://www.producthunt.com/posts/calmalma). A crowdfunded "AI meditation app" had raised $0 of a $2,000 goal at capture — [iFundWomen](https://www.ifundwomen.com/projects/new-age-meditation-app)
- Sector funding: Tracxn reports that mindfulness and meditation apps raised $11.2M across 4 rounds in 2026 through September, but the same page also shows $18.4M YTD (internally inconsistent) — [Tracxn](https://tracxn.com/d/trending-business-models/startups-in-mindfulness-and-meditation-apps/__fBMxIvfWSiclTfC7P3FEh6vCieiZILZK-GKv_trCKH8)

### Inferences (analysis)
- Whitespace: no well-funded player publicly ships "one sentence → a newly generated, full audio-visual session, refined by modular edits and an adaptive journey". Incumbents generate conversation (Ebb, Reflect) and curate audio. Endel generates sound but not guided scripts. Rosebud generates text reflection. Aurelia's combination looks distinctive, though small generated-meditation apps exist and copying would be cheap at the surface.
- Pricing: Aurelia's $10/mo / $100/yr sits close to Rosebud's base tier and Endel's middle tier. It is above Calm Sleep ($69.99/yr) and far above Insight Timer's free library. Generation cost (TTS, LLM) per session has to fit inside that price.
- Strategic signal: Sword/Headspace and Woebot point toward clinical, enterprise and safety-evaluated AI. A consumer wellness product that stays clearly non-clinical avoids that cost but must hold the line on claims (see section 5).
- The biggest competitive risk is less a startup than Headspace-under-Sword or Calm adding generative sessions on top of their libraries and distribution. Insight Timer has chosen not to.

### Gaps
- Balance (Elevate Labs), Breathwrk, Mindsera, Hapday, Wysa, and ElevenLabs-powered meditation apps were not researched in depth because of the tool-call budget; no figures are given for them.
- No App Store sentiment analysis specific to AI meditations was found.
- Headspace and Calm subscription prices for 2026 were not verified from primary pages.

## 4. Evidence and consumer attitudes on AI-generated wellness content

### Takeaway
Use is mainstream: about a third of US adults have used AI chatbots for health or mental-health advice. Trust splits sharply between users and non-users, concern about AI worsening mental health is rising, and comfort with an "AI therapist" is low. A non-clinical, wellness-framed product with visible human craft fits these attitudes better than a "therapist" frame.

### Cited Findings
- KFF tracking poll: 32% of US adults used a chatbot such as ChatGPT, Claude or Gemini for physical or mental health advice in the past year. 62% of users trust AI for mental health versus 16% of non-users, and 38% of mental-health users still don't trust it for reliable information — [KFF](https://www.kff.org/health-information-trust/new-kff-tracking-poll-on-health-information-and-trust-finds-one-in-three-adults-have-used-ai-chatbots-for-health-advice/) (2026; exact date not captured)
- YouGov: Americans are more likely than in June 2025 to be "very concerned" about AI exacerbating mental health problems (43%). In August 2025, 23% of under-30s and 13% of over-65s said they would be comfortable with an AI therapist — [YouGov](https://yougov.com/en-us/articles/54755-americans-are-increasingly-concerned-about-ai-exacerbating-mental-health-problems)
- NAMI-linked preprint (n=454): 42.1% had used a chatbot for mental health, and 32.3% of those rated it "very helpful" — [medRxiv preprint, July 2026](https://www.medrxiv.org/content/10.64898/2026.07.11.26357785v1.full) (not peer-reviewed; self-selected sample)
- Research attention to harms, e.g. "delusional spirals" in human–LLM chat logs — [arXiv 2603.16567](https://arxiv.org/pdf/2603.16567)
- Insight Timer markets "No AI" as a selling point — [Newswise, 2026-07-21](https://www.newswise.com/articles/american-counseling-association-adds-insight-timer-to-prestigious-strategic-partner-network)

### Inferences (analysis)
- Aurelia's likely early adopters overlap with the 32% who already use chatbots, the segment where trust is highest. The mass market (non-users, 16% trust) needs proof and human signals.
- Aurelia generates guided audio rather than an open-ended therapeutic chat, which lowers the surface for the harms behind the rising concern. Its free-text "how I feel" input still needs crisis detection.
- Insight Timer's "No AI" stance is itself evidence that a segment values human authorship. Aurelia should A/B test disclosure language and consider human-voiced or human-authored options.

### Gaps
- No Pew or APA 2025–26 surveys surfaced in searches. No survey specific to AI-generated meditation or sleep audio (as opposed to chatbots) found. No systematic App Store review analysis of AI meditation apps found.

## 5. Regulatory and safety context for AI mental-wellness products

### Takeaway
In the US, a low-risk general-wellness product stays outside FDA device regulation (guidance revised 2026-01-06, AI not directly addressed). The real pressure is state law: Illinois, Nevada and Utah restrict AI "therapy" and require disclosure, and California SB 243 requires suicide/self-harm protocols for companion chatbots from 2026-01-01. The FTC is also scrutinising companion chatbots (6(b) orders, Sept 2025). In the EU, AI Act Article 50 transparency duties apply from 2026-08-02. Aurelia should stay in wellness claims, disclose AI clearly, and build crisis handling from day one.

### Cited Findings
- FDA issued revised final General Wellness and Clinical Decision Support guidances on 2026-01-06, superseding the 2019/2022 versions. The two-part test (intended only for general wellness, low risk) is unchanged. A new section covers non-invasive sensors that estimate physiological parameters (e.g. HRV, blood pressure). One analysis notes the guidance does not directly address AI — [Covington](https://www.cov.com/en/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products); [Cooley, 2026-01-20](https://www.cooley.com/news/insight/2026/2026-01-20-fda-opens-aperture-for-wearables-in-latest-general-wellness-guidance); [Jones Day](https://www.jonesday.com/en/insights/2026/01/a-relaxing-2026-fda-updates-general-wellness-and-clinical-decision-support-software-guidance); [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2026/1/key-updates-in-fdas-2026-general-wellness-and-clinical-decision-support-software-guidance)
- Woebot cited FDA authorisation costs and LLM regulatory uncertainty for its consumer exit — [STAT, 2025-07-02](https://www.statnews.com/2025/07/02/woebot-therapy-chatbot-shuts-down-founder-says-ai-moving-faster-than-regulators/)
- FTC 6(b) inquiry (September 2025) into AI companion chatbots, with orders to seven companies including Meta, OpenAI, Alphabet, xAI, Snap and Character Technologies, focused on harms to children and teens — [Astraea Law tracker](https://astraea.law/insights/ai-companion-chatbot-laws-by-state); [The Health Tech Signal](https://thehealthtechsignal.com/article/ai-mental-health-chatbot-regulation-2026) (secondary; verify against ftc.gov)
- Illinois HB 1806 (Wellness and Oversight for Psychological Resources Act, August 2025) bars AI from independently providing therapy or making therapeutic decisions. Nevada AB 406 (effective 2025-07-01) bars AI from presenting as able to provide professional mental health care. Utah HB 452 requires AI disclosure and limits data sharing and advertising in mental-health chatbots. California SB 243 (effective 2026-01-01) requires suicide/self-harm protocols for companion chatbots. NY, NE, TN, ID, OR and WA have related laws — [Quartz explainer](https://qz.com/state-laws-restricting-ai-mental-health-care-guide-072826); [verticomply](https://verticomply.com/blog/state-ai-healthcare-laws-2026). Rhode Island/Maine bans (reported effective 2026-07-20) appear in only one source — [legaltechdigest](https://legaltechdigest.com/news/illinois-nevada-rhode-island-and-maine-ban-ai-therapy-amid-growing-scrutiny) (unconfirmed)
- EU AI Act Article 50: chatbot providers must make clear that users are talking to an AI, at the latest at first interaction. Emotion-recognition systems must inform the people exposed to them. The Article 5 ban covers emotion recognition in workplaces and education. Obligations apply from 2026-08-02, with a reported grace period to 2026-12-02 for marking AI-generated content from systems already on the market. Maximum fines are €15M or 3% of turnover — [artificialintelligenceact.eu Article 50 guide](https://artificialintelligenceact.eu/transparency-rules-article-50/); [GDPR Local](https://gdprlocal.com/eu-ai-act-article-50/)
- Incumbent practice: Insight Timer's Reflect disclaims diagnosis and treatment and lists crisis lines — [Insight Timer AI safety](https://insighttimer.com/ai-safety). Sword is adding the MindGuard/MindEval safety frameworks to Headspace — [MobiHealthNews](https://www.mobihealthnews.com/news/sword-health-acquire-headspace-all-cash-deal)

### Inferences (analysis)
- Aurelia's "how I feel" sentence is free text about mental state. Even as a wellness product it should detect crisis language and route to crisis lines (988 etc.), matching Insight Timer's practice and the spirit of California SB 243. It should avoid "therapy", "treat" and "anxiety disorder" claims, given Illinois and Nevada and the FDA wellness boundary.
- Wearable data (Aurelia v5 asks for a wearable) is now more comfortably inside wellness under the 2026 FDA sensor section, provided claims stay non-diagnostic.
- EU launch: AI-voiced sessions likely count as AI-generated audio requiring marking/disclosure (Art. 50), and inferring emotional state from voice input could trigger emotion-recognition disclosure. This is analysis to verify with counsel.
- The "Wellness State Graph learns which elements help which person" is health-adjacent personal data, so the data-use transparency in Insight Timer's Reflect page (opt-out, no third-party sharing) is the baseline to match.

### Gaps
- FDA Digital Health Advisory Committee meeting on generative-AI mental health (reportedly November 2025): no primary source found.
- FTC primary press release not fetched. No FTC enforcement actions specific to wellness AI apps found.
- EU AI Act: Commission Article 50 guidelines and any Digital Omnibus delays not verified.
