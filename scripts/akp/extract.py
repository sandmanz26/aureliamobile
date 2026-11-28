"""Extract the rows the AKP catalogue and the 125 StateFlips draw on (U141, J203).

Reads the business owner's workbooks in docs/briefs/ (stdlib only: an .xlsx is a
zip of XML) and writes src/admin/data/generated/akpSource.ts, which
src/admin/data/stateFlips.ts and akps.ts build from. Run from the repo root:

    python3 -I scripts/akp/extract.py

Nothing is invented here: every row keeps the sheet's own ID (or, where the
sheet has none, its VES id + evolutionary frame). Excel stored some frames
("1-3") as dates; they are turned back into "month-day" as the sheet means them.
"""
import datetime
import html
import json
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BRIEFS = os.path.join(ROOT, 'docs', 'briefs')
OUT = os.path.join(ROOT, 'src', 'admin', 'data', 'generated', 'akpSource.ts')


def load(name):
    z = zipfile.ZipFile(os.path.join(BRIEFS, name))
    ss = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss = [html.unescape(re.sub('<[^>]+>', '', s)) for s in re.findall(r'<si>(.*?)</si>', z.read('xl/sharedStrings.xml').decode(), re.S)]
    wb = z.read('xl/workbook.xml').decode()
    rels = z.read('xl/_rels/workbook.xml.rels').decode()
    out = {}
    for sheet, rid in re.findall(r'<sheet [^>]*name="([^"]*)"[^>]*r:id="([^"]*)"', wb):
        tgt = re.search(r'Id="%s"[^>]*Target="([^"]*)"' % rid, rels) or re.search(r'Target="([^"]*)"[^>]*Id="%s"' % rid, rels)
        x = z.read('xl/' + tgt.group(1).lstrip('/').replace('xl/', '')).decode()
        rows = []
        for row in re.findall(r'<row[^>]*>(.*?)</row>', x, re.S):
            r = {}
            for a, v in re.findall(r'<c ([^>]*?)(?:/>|>(.*?)</c>)', row, re.S):
                col = re.search(r'r="([A-Z]+)', a).group(1)
                m = re.search(r'<v>(.*?)</v>', v or '', re.S) or re.search(r'<t[^>]*>(.*?)</t>', v or '', re.S)
                if m:
                    r[col] = html.unescape(ss[int(m.group(1))] if 't="s"' in a else m.group(1)).strip()
            if r:
                rows.append(r)
        out[html.unescape(sheet).strip()] = rows
    return out


def frame(v):
    """'0-1' stays; an Excel date serial (45292 = 1 Jan) becomes '1-1'; '2.0' becomes '2'."""
    try:
        n = float(v)
    except ValueError:
        return v
    if n > 40000:
        d = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(n))
        return f'{d.month}-{d.day}'
    return str(int(n)) if n == int(n) else v


def clean(s, n=220):
    s = re.sub(r'\s+', ' ', (s or '').replace('"', '').replace('“', '').replace('”', '')).strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + '…'


def unique_ids(rows, key='id'):
    seen = {}
    for r in rows:
        base = r[key]
        seen[base] = seen.get(base, 0) + 1
        if seen[base] > 1:
            r[key] = f'{base}#{seen[base]}'
    return rows


def concepts(rows):
    out = []
    for r in rows:
        if not re.match(r'^[A-Z]{1,2}\d?$', r.get('A', '')) or not r.get('C') or r.get('A') == 'VESID':
            continue
        out.append({'id': f"{r['A']} {frame(r.get('B', ''))}", 'ves': r['A'], 'frame': frame(r.get('B', '')), 'name': clean(r['C'], 80),
                    'objective': clean(r.get('D', ''), 160), 'obstacle': clean(r.get('H', ''), 40), 'wellness': clean(r.get('I', ''), 40)})
    return unique_ids(out)


# --------------------------------------------------------------------------
# AKP v2 (U150, J208): more AKPs, drafted by us from the business owner's
# briefs. Every row below is "drafted by us — to review" unless it names a
# workbook. Lists are written as "Name" or "Name = plain definition", ";"-
# separated. IDs are fixed by position inside each list, so appending to a list
# never renumbers what is already there; never reorder or delete a list item —
# retire it in the admin instead (soft delete) so IDs stay stable.
# akps.ts turns each row into an AKP: it adds the StateFlips (by shared words,
# then by dimension), the typed link to a goal, and skips any row whose
# normalised name another AKP of the same family already has.
# --------------------------------------------------------------------------

DRAFT = 'drafted by us — to review'
PENDING_BRAND = 'drafted by us — to review; pending his marketing AKP sheet (ReadMe types from the 2026-11-27 plan)'


def items(text):
    out = []
    for part in text.split(';'):
        part = part.strip()
        if not part:
            continue
        name, _, d = part.partition(' = ')
        out.append((name.strip(), d.strip()))
    return out


def toks(s):
    return {w for w in re.findall(r'[a-z]+', s.lower()) if len(w) > 3}


def best(cands, text, i):
    """The candidate id whose name shares most words with text; round-robin when none does."""
    t = toks(text)
    scored = sorted(((len(t & toks(n)), -k, cid) for k, (cid, n) in enumerate(cands)), reverse=True)
    if scored and scored[0][0] > 0:
        return scored[0][2]
    return cands[i % len(cands)][0]


# ---- Wellness: VOICE (TTS parameters). Links: fed-by an identity Light AKP.
VOICE = [
    ('TB', 'Timbre', 'ID-L16', 'Low warm baritone; Soft alto; Breathy close whisper; Clear mid-range; Bright light soprano; Gravelly elder; Smooth velvet; Neutral broadcast; Husky intimate; Resonant chest voice'),
    ('PC', 'Pace', 'ID-L17', '90 words a minute = very slow, for the last minutes before sleep; 100 words a minute; 110 words a minute = slow, the sleep chapter default; 125 words a minute = calm conversational; 140 words a minute = everyday conversational; 155 words a minute = energising, for mornings; Decelerating 130 to 100 words a minute; Accelerating 100 to 140 words a minute = for wake-up chapters'),
    ('WA', 'Warmth', 'ID-L16', 'Cool clinical warmth; Neutral kind warmth; Warm friendly; Very warm nurturing; Playful warmth'),
    ('BR', 'Breath', 'ID-L10', 'Audible soft inhale cues; Silent breath between lines; Breath-matched phrasing 4 in 6 out; Shared audible sigh; Breath counted aloud'),
    ('PS', 'Pause', 'ID-L17', 'One-second line gaps; Two-second line gaps; Four-second line gaps; Eight-second line gaps; Pauses lengthening from 2 to 8 seconds; Thirty-second silence block; Two-minute silence block; Five-second pause after a question'),
    ('PI', 'Pitch and intonation', 'ID-L16', 'Downward cadence at line ends; Flat even contour; Gentle rise on questions; Narrow pitch range; Wide expressive pitch range'),
    ('DY', 'Volume and dynamics', 'ID-L16', 'Soft constant level; Voice fades out at the end; Voice fades in at the start; Close-mic proximity; Room-distance placement'),
    ('PE', 'Persona', 'ID-L16', 'Healer voice; Coach voice; Sage voice; Friend voice; Guide voice; Elder voice; Scientist voice; Poet voice; Monk voice; Nurse voice'),
    ('LA', 'Language and accent', 'ID-L30', 'Neutral US English; British English; Australian English; Soft Irish English; Indian English; Spanish-accented English; Spanish narration; German narration; French narration; Hindi narration; Arabic narration; Mandarin narration'),
    ('GA', 'Gender and age presentation', 'ID-L16', 'Adult female voice; Adult male voice; Androgynous voice; Older female voice; Older male voice; Young adult voice'),
    ('PR', 'Prosody style', 'ID-L16', 'Hypnotic near-monotone; Storytelling prosody; Crisp instructional prosody; Lullaby sing-song; Emphatic affirming prosody; Relaxed conversational prosody'),
    ('ST', 'Delivery structure', 'ID-L19', 'Voice stops for the last two minutes; Voice only at transitions; Continuous narration; Call and response; Voice ducks music by 12 dB; Voice placed left and right (binaural)'),
    ('TT', 'TTS control', 'ID-L17', 'Speaking rate minus 20 percent; Pitch down two semitones; Reduced emphasis; Break tags at every comma; High voice stability; Low style exaggeration; High speaker similarity; Speaker boost off'),
    ('PZ', 'Preset', 'ID-L16', 'Sleep narrator preset = low warm voice, 105 words a minute, pauses lengthening, fades out; Morning coach preset = bright clear voice, 145 words a minute, short pauses; Anxiety first-aid preset = close warm voice, breath-matched phrasing, 2-second gaps; Grief companion preset = soft alto, slow, long silences; Focus primer preset = neutral broadcast voice, 130 words a minute, crisp; Body scan preset = warm mid-range, 110 words a minute, 4-second gaps; Self-compassion preset = very warm nurturing voice, gentle rise on questions; Breathwork preset = breath counted aloud, call and response; Yoga nidra preset = hypnotic near-monotone, 100 words a minute; Pain relief preset = slow, low, close-mic; Confidence preset = emphatic affirming prosody, 135 words a minute; Relationship repair preset = friend voice, conversational; Spiritual preset = monk voice, long silences; Child-friendly preset = playful warmth, simple words; Walking preset = 140 words a minute, voice only at transitions; Commute preset = clear mid-range, ducked under music; Night-wake preset = whisper-close, 90 words a minute, no music swell; Exam-stress preset = calm conversational, crisp steps; Shift-worker preset = warm voice, light-blocking cues; Elder-friendly preset = slower pace, wider pitch, louder level'),
]

MUSIC = [
    ('Rhythm, Instrumentation, Harmony', 'Tempo 40 BPM; Tempo 50 BPM; Tempo 55 BPM; Tempo 60 BPM; Tempo 66 BPM; Tempo 72 BPM; Tempo 80 BPM; Tempo 90 BPM; Tempo 100 BPM; Tempo 110 BPM; Tempo 120 BPM; Felt piano; Solo cello; Handpan; Tibetan singing bowl; Crystal bowl; Shakuhachi flute; Kalimba; Concert harp; Analog pad synth; String ensemble; Fingerpicked acoustic guitar; Native flute; Tanpura drone; Gong; Rain stick; Frame drum; Monochord; Choir pad; Electric piano; Music box; Major pentatonic; Minor pentatonic; Dorian mode; Lydian mode; Aeolian mode; Suspended chords; Open fifths; Drone in D; Drone tuned to 432 Hz; Slow I–IV progression; Static harmony'),
    ('Compositional Methods', 'Delta binaural beat 2 Hz; Theta binaural beat 6 Hz; Alpha binaural beat 10 Hz; Beta binaural beat 15 Hz; Isochronic tones; Monaural beats; Pink noise; Brown noise; White noise; Solfeggio 528 Hz; Field recording collage; Minimalist loop; Tonal drone; Polyrhythm 3 against 2; Heartbeat pulse at 60'),
    ('Musical Techniques', 'Tempo deceleration; Volume fade; Low-pass filter sweep; Reverb bloom; Four-bar breath phrases; Sidechain breathing; Stereo widening; Octave drop; Sustain pedal wash; Call and response motif; Delayed resolution; Cadence to the tonic; Silence gap in the music; Eight-second crossfade; Arpeggio slowdown; Key change down a step; Swell to a soft peak; Low dynamic range; Slow pan drift; Slow tremolo'),
    ('Musical Mechanisms', 'Rhythmic entrainment; Breath-locked phrasing; Predictable repetition; Gradual unpredictability; Harmonic tension and release; Masking of background noise; Arousal down-shift; Arousal up-shift; Familiarity anchor; Novelty spark'),
    ('Musical Emotions & States', 'Serenity; Awe; Tenderness; Nostalgia; Groundedness; Joy; Courage; Melancholy release; Safety; Spaciousness; Focus; Renewal'),
    ('Musical Outcomes', 'Sleep onset; Lower heart rate; Focus block; Grief processing; Energy lift; Anxiety relief; Pain distraction; Creative flow'),
    ('Compositional Frameworks', 'Iso principle; Psychoacoustic masking; Guided imagery and music; Polyvagal-informed scoring; Circadian scoring; Arousal curve design'),
    ('Sonic Personas (Archetypes)', 'Muse; Mystic; Nurturer; Explorer; Elder; Inner child; Warrior'),
    ('Sonic Styles & Tones', 'Crisp; Dense; Airy; Lo-fi; Cinematic; Organic; Glassy; Earthy; Shimmering'),
    ('Sonic Environments', 'Forest glade; Ocean shore; Mountain wind; Desert night; Temple bells; Rainforest; Snowfall hush; Crackling fire; Mountain stream; Distant thunderstorm; Rain on a city window; Cave drips; Meadow birdsong; Night crickets'),
]

IMAGE = [
    ('Visual Techniques', 'Soft gradients; Bokeh; Film grain; Long exposure; Tilt-shift; Double exposure; Watercolour wash; Low contrast; Atmospheric haze; Soft vignette; Macro texture; Silhouette; Golden-hour light; Blue-hour light; Mist layers; Water reflections'),
    ('Visual Methods', 'Chromotherapy; Biophilia; Fractal patterns; Mandala symmetry; Prospect and refuge; Soft fascination; Colour breathing'),
    ('Visual Mood & Symbolism', 'Lotus; Tree of life; Spiral; Rising sun; Open door; Bridge; Feather; Candle flame; Moon phases; River flow; Mountain peak; Seed sprouting; Enso circle; Butterfly'),
    ('Visual Environments', 'Temples; Mountain lake; Desert dunes; Zen garden; Aurora sky; Bamboo grove; Lotus pond; Starry night; Meadow at dawn; Snowy pines; Waterfall; Light in a cave; Sea cliff; Rice terraces; Lavender field; Candlelit room'),
    ('Visual Mechanisms', 'Spatial flow; Single focal point; Negative space; Low horizon line; Leading lines; Depth layering; Repeating rhythm; Colour temperature shift'),
    ('Visual Frameworks', 'Golden ratio; Rule of thirds; Attention restoration theory; Kaplan preference matrix; Visual hierarchy'),
    ('Visual Archetypes', 'The Sage; The Mother; The Wanderer; The Guardian; The Child; The Alchemist'),
    ('Visual Styles & Tones', 'Painterly; Photoreal; Dreamlike; Japandi; Celestial; Botanical illustration; Abstract flow; Nordic calm'),
    ('Lighting, Framing, Texture, Motion, Symbolism', 'Backlit halo; Candlelight 1800 K; Dappled light; Overcast soft light; Rim light; Slow zoom; Parallax drift; Ken Burns pan; Breathing scale 1.00 to 1.03; Floating particles; Square framing; Wide panorama; Rough paper texture; Linen texture; Silk texture'),
    ('Visual Outcomes', 'Arousal downshift; Restored attention; Evoked awe; Feeling held; Spark of hope; Less night-time glare'),
    ('Colour palettes', 'Sage green palette; Dusk lavender palette; Warm amber palette; Ocean teal palette; Terracotta palette; Cream and gold palette; Deep indigo palette; Rose quartz palette; Forest moss palette; Sand beige palette; Charcoal and ember palette; Pale sky palette'),
]

VIDEO = [
    ('Cinematic Techniques', 'Half-speed slow motion; Dissolve; Match cut; No jump cuts; Cloud timelapse; Hyperlapse; Rack focus; Slow dolly in; Crane rise; Static long take; Fade to black; Three-second cross dissolve; Speed ramp down; Reverse motion; Underwater shot'),
    ('Cinematic Methods', 'Nature documentary; First-person walk; Abstract motion graphics; Organic stop-motion'),
    ('Cinematic Frameworks', 'Kuleshov effect; Three-act calm arc; Micro hero’s journey; Circular structure; Montage of attractions'),
    ('Emotional Tone', 'Wonder; Intimacy; Hope; Release; Reverence; Playfulness; Solitude'),
    ('Narrative Dynamics', 'Gradual unveiling; Return home; Seasonal cycle; Light out of darkness; Journey upstream; Descent and rise'),
    ('Cinematic Environments', 'Mountain ridge; Desert road; Rain on a window; Snowfield; Lake at dawn; Night sky; Walled garden; Waterfall basin; Sea of clouds'),
    ('Cinematic Styles & Tones', 'Lush; Monochrome; Pastel; High-key; Low-key; Vintage film; Documentary'),
    ('Camera, Sound, Aspect, Edits', 'Landscape 16:9; Square 1:1; 4K at 24 fps; Smooth 60 fps; Subtle handheld; Gimbal glide; Drone aerial; Macro close-up; Ambient room tone; Foley footsteps; Sound bridge between scenes; Audio-led cuts; Cut on the exhale; Average shot length 8 seconds; Average shot length 20 seconds; Warm colour LUT'),
    ('Visual Archetypes', 'Wanderer figure; Teacher figure; Mother figure; Trickster figure'),
    ('Video Outcomes', 'Sleep wind-down; Morning activation; Grounding; Holding grief; Focus priming'),
]

SCRIPT = [
    ('TQ', 'Techniques', 'Box breathing 4-4-4-4; 4-7-8 breathing = in for 4, hold for 7, out for 8; Coherent breathing at 5.5 breaths a minute; Physiological sigh = two inhales, one long exhale; Alternate-nostril breathing; Extended exhale 4 in 6 out; Humming bee breath; Body scan feet to head; Progressive muscle relaxation; 5-4-3-2-1 grounding; Safe-place visualisation; Loving-kindness phrases; Cognitive defusion = noticing a thought as a thought; Thought record; Worry postponement; Three good things; Self-compassion break; Butterfly hug; Havening touch; Yoga nidra rotation of awareness; Counting down from ten; Noting practice; Open monitoring; RAIN practice = recognise, allow, investigate, nurture; STOP practice; Urge surfing; Future-self visualisation; Values card sort; If-then implementation intention; Paradoxical intention for sleep; Stimulus control reminder; Cognitive shuffle; Mantra repetition; Affirmation ladder; Inner child dialogue; Forgiveness letter; Boundary script rehearsal; Compassionate letter to self; Decatastrophising; Behavioural activation micro-step; Pendulation; Titration; Orienting to the room; Tense and release hands; Grounding through the feet; Light visualisation; Chakra colour visualisation; Heart-focused breathing; Walking meditation cue; Mindful eating cue; Savouring; Reminiscence; Hope map; Five-step problem solving; Assertive I-statement; Active listening practice; Gratitude letter; Awe walk prompt; Sky gazing; Candle gazing; Sound bath listening; Silent sitting; What-went-well journaling; Unsent letter journaling; Body appreciation; Pain reappraisal; Energy check-in scale; Morning intention; Evening review; Wind-down countdown; Morning light reminder'),
    ('AR', 'Archetypes', 'Healer narrator; Sage narrator; Guide narrator; Coach narrator; Friend narrator; Elder narrator; Mother narrator; Explorer narrator; Warrior narrator; Mystic narrator; Scientist narrator; Poet narrator'),
    ('TN', 'Styles & Tones', 'Gentle invitational tone; Direct instructional tone; Poetic imagery tone; Scientific explanatory tone; Playful light tone; Reverent sacred tone; Matter-of-fact tone; Nurturing tone; Encouraging upbeat tone; Minimal sparse tone; Storytelling tone; Second-person present tense'),
    ('SE', 'Settings', 'Bedroom at night; Morning kitchen; On the commute; Desk break at the office; Hospital waiting room; Park bench; Before an exam; After an argument; Lunch break; In the shower; Before a hard conversation; Night feed with a newborn; Dawn after a night shift; Airplane seat; Cool-down after the gym'),
]

# ---- Identity: instances of the Light 35 sub-dimensions (index = ID-Lnn).
IDENTITY = {
    2: 'Analytical thinker; Intuitive thinker; Visual thinker; Verbal thinker',
    3: 'Regulates with breath; Regulates through movement; Regulates by talking it through; Regulates by distraction; Suppresses and avoids',
    4: 'Low baseline arousal; Moderate baseline arousal; High baseline arousal (wired); Fluctuating arousal',
    5: 'Secure attachment; Anxious attachment; Avoidant attachment; Disorganised attachment',
    6: 'Morning lark; Evening owl; Intermediate chronotype; Irregular (shift work)',
    7: 'Secular; Spiritual but not religious; Practising religious; Spiritually curious',
    8: 'Risk averse; Balanced risk; Novelty seeking',
    10: 'Breathwork beginner; Practised breather; Advanced breathwork',
    11: 'Easily distracted; Can hold attention 5 minutes; Can hold attention 20 minutes or more',
    12: 'Low interoception; Moderate interoception; High interoception',
    13: 'Reframing novice; Reframing developing; Reframing fluent',
    14: 'Harsh inner critic; Mixed inner voice; Kind inner voice',
    16: 'Prefers a low warm voice; Prefers a bright clear voice; Prefers a whisper close voice; Prefers no voice (music only)',
    17: 'Prefers very slow tempo (50–60 BPM); Prefers moderate tempo (60–80 BPM); Prefers upbeat tempo (90+ BPM)',
    18: 'Prefers warm earthy colours; Prefers cool blue-green colours; Prefers muted pastels; Prefers high-contrast dark',
    19: 'Prefers 3–5 minute sessions; Prefers 10 minute sessions; Prefers 20 minute sessions; Prefers 30 minutes or more',
    20: 'Prefers solo practice; Prefers practising with a partner; Prefers group practice',
    22: 'Feeling anxious now; Feeling low or flat now; Feeling irritable now; Feeling calm now; Feeling overwhelmed now',
    23: 'Low cognitive load now; Medium cognitive load now; High cognitive load now',
    24: 'Within the window of tolerance; Hyperaroused (above the window); Hypoaroused (below the window)',
    25: 'Trauma history: avoid deep body focus; Respiratory condition: no breath holds; Epilepsy: no flicker or strobe; Psychosis risk: no deep altered states; Pregnancy: no long breath holds',
    27: 'Goal: sleep better; Goal: less stress; Goal: better focus; Goal: heal a relationship; Goal: more meaning',
    28: 'Values achievement; Values connection; Values security; Values growth; Values spirituality',
    29: 'Parent of young children; Shift worker; Student; Caregiver; Remote worker',
    30: 'Collectivist framing; Individualist framing; Faith language welcome; Secular language only',
    31: 'Cold start (few signals); Stable profile; Drifting profile',
    32: 'Engagement utility; Outcome utility; Novelty utility',
    33: 'Chip: because you like slow music; Chip: because you sleep late; Chip: because you chose breathwork',
    34: 'Shareable data; Sensitive health data; Never-share data',
    35: 'Weekly re-estimate; Event-driven update; Manual override by the person',
}

# ---- Product: the 13 sheet dimensions, ten more each, continuing the sheet's IDs.
PRODUCT_MORE = [
    ('UO', 'UX Outcomes', 1, 'Calm Arrival; Felt Progress; Effortless Return; Sense of Agency; Emotional Safety; Quiet Delight; Clarity of Next Step; Felt Belonging; Trust in Guidance; Completion Satisfaction'),
    ('UM', 'UX Mechanisms', 2, 'Gentle Social Proof; Soft Loss Aversion; Goal Gradient; Variable Reward; Endowed Progress; Commitment Device; Kind Defaults; Peak-End Shaping; Open-Loop Prompt; Reciprocity Gift'),
    ('IM', 'Interaction Mechanics', 2, 'Breath-Synced Animation; Drag-to-Set Duration; Calm Pull-to-Refresh; Snap Points; Hold-to-Confirm; Shake-to-Undo; Two-Finger Scrub; Tap Anywhere to Pause; Rubber-Band Edges; Weighted Sliders'),
    ('CS', 'Cognitive User States', 0, 'Mild Anxiety; Physical Fatigue; Light Curiosity; Restlessness; Fresh Grief; Overwhelm; Boredom; Fragile Hope; Self-Doubt; Night Wakefulness'),
    ('PS', 'Product Usage Skills', 2, 'Session Building; Check-in Habit; Voice Prompting; Favourites Curation; Progress Reading; Reminder Setup; Sharing a Session; Offline Listening; Personalising the Voice; Journal Writing'),
    ('NM', 'Navigation Methods', 3, 'Bottom Tab Bar; Deep-Link Return; Resume Card; Search by Feeling; Breadcrumb Trail; Contextual Back; Quick Actions Sheet; Swipe Between Chapters; Floating Mini-Player; Notification Entry'),
    ('IT', 'Interaction Techniques', 3, 'Spoken Brief; Mood Slider; Emoji Check-in; Haptic Breath Pulse; Lock-Screen Controls; Home-Screen Widget Start; Watch Crown Scrub; Sleep Timer; Picture-in-Picture; Desktop Keyboard Shortcuts'),
    ('FF', 'Flow Frameworks', 1, 'First Session in 60 Seconds; Daily Check-in Loop; Five-Chapter Journey; Win-Back Flow; Upgrade at the Limit; Referral Loop; Reflection After a Session; Crisis Off-Ramp; Bedtime Routine Flow; Weekly Review'),
    ('SA', 'System Archetypes', 1, 'The Coach (The Trainer); The Nurse (The Carer); The Elder (The Wise One); The Host (The Welcomer); The Witness (The Listener); The Artist (The Maker); The Monk (The Still One); The Navigator (The Planner); The Jester (The Lightener); The Steward (The Keeper)'),
    ('ST', 'UI Styles & Tones', 4, 'Warm Espresso and Gold; Soft Daylight; Amber Night Mode; Paper Calm; Minimal Line; Organic Shapes; Gentle Motion; High Legibility; Quiet Typography; Photographic Warmth'),
    ('SC', 'Session Contexts', 0, 'Bedtime in Bed; Lunch Break Reset; Morning Routine; Before a Meeting; After a Workout; Waking at Night; Slow Weekend; In a Waiting Room; Travelling; Before Exams'),
    ('PE', 'Platform Environments', 4, 'iPhone App; Android App; Apple Watch App; Wear OS App; iPad App; Desktop Web App; Mobile Web App; Smart Speaker Skill; CarPlay Audio; Spatial Audio Headphones'),
    ('DP', 'Dynamic Parameters', 4, 'Session Length Parameter; Voice Speed Parameter; Music-to-Voice Volume Ratio; Brightness Curve; Haptic Intensity; Reminder Time; Chapter Count; Text Size; Motion Reduction; Pause Length Parameter'),
]
LOGIC = {0: 'Layer 0 Input (biological bandwidth)', 1: 'Layer 1 Intent (the causal brain)', 2: 'Layer 2 Logic (the intent engine)', 3: 'Layer 3 Action', 4: 'Layer 4 Render (somatic delivery)'}
SHEET_LOGIC = {'UX Outcomes': 1, 'UX Mechanisms': 2, 'Interaction Mechanics': 2, 'Cognitive User States': 0, 'Product Usage Skills': 2, 'Navigation Methods': 3, 'Interaction Techniques': 3,
               'Flow Frameworks': 1, 'System Archetypes': 1, 'UI Styles & Tones': 4, 'Session Contexts': 0, 'Platform Environments': 4, 'Dynamic Parameters': 4}
# Five dimensions to make his 18 (his list of 18 has not arrived: names drafted by us).
PRODUCT_EXTRA = [
    ('AX', 'Accessibility', 4, 'Screen Reader Labels; Dynamic Type; Reduced Motion Mode; Captions for the Voice; AA Colour Contrast; Large Tap Targets; Haptic Alternatives to Sound; One-Handed Reach; Dyslexia-Friendly Text; Audio Descriptions of Images'),
    ('TS', 'Trust & Safety', 1, 'Crisis Signposting; Risk Keyword Detection; Clinician Escalation; Content Warnings; Age Gate; Medical Disclaimer; Safe Defaults for Breath Holds; Report a Problem; Calm Error States; Human Review Queue'),
    ('DV', 'Data & Privacy', 0, 'Consent Ledger; Export My Data; Delete My Data; Local-Only Journal; Health Data Opt-In; Anonymised Analytics; Retention Window; Wearable Permissions; Encryption at Rest; Privacy Label'),
    ('PZ', 'Personalisation Engine', 2, 'Cold-Start Quiz; Preference Learning; Next-Best Chapter; Time-of-Day Adaptation; Mood-Aware Ranking; Explain-Why Chip; Avoid Repeats; Familiarity Mix; Thumbs Feedback; Profile Drift Detection'),
    ('MS', 'Monetisation Surfaces', 3, 'Free Week Trial; Paywall at the Limit; Annual Discount Offer; Family Plan; Gift a Month; Employer Code Redeem; Coin Balance; Cancel-Flow Save Offer; Restore Purchases; Receipt Screen'),
]
SURFACES = [('ONB', 'Onboarding', 'the first-run welcome and questions'), ('CRT', 'Create chat', 'where a person briefs a session'), ('PLY', 'Player', 'where a chapter plays'),
            ('LIB', 'Library', 'saved and played sessions'), ('PRG', 'Progress', 'check-ins and the journey'), ('ME', 'Me and settings', 'profile, plan and preferences'),
            ('PAY', 'Checkout', 'trial, plan and payment'), ('CHK', 'Check-in', 'the before and after feeling question')]
SURFACE_WORDS = {'ONB': 'onboarding first aha trust calibration ease', 'CRT': 'prompt intent conversational voice threading co-pilot scaffolding', 'PLY': 'flow immersion breath haptic somatic pulse audio prosody luminance blur silence',
                 'LIB': 'navigation object semantic zoom spatial persistence', 'PRG': 'mastery feedback recursive progress wisdom loop', 'ME': 'archetype style tone platform typography',
                 'PAY': 'friction agency decision fatigue optimistic', 'CHK': 'state stress load skepticism mirroring'}

# ---- Business (from businessFunnel stages, B2B2C channels, pricing, retention).
BUSINESS = [
    ('FS', 'Funnel stage', 'Visit = someone lands on the site or store page; Activation = hears a session on the first visit; Aha = finishes their own first session; Felt better = check-in after is above before; Free limit hit = uses the free week fully; Upgrade to Plus = chooses $10/month at the limit; Week-1 return = back after a week; Month-1 retention = still using after a month; Referral = invites someone who signs up'),
    ('CH', 'B2B2C channel', 'Employer wellbeing benefit; Health insurer member perk; Therapist referral; Clinic waiting-room code; University student services; Gym membership add-on; Yoga studio partner; Employee assistance programme; Pharmacy partnership; Telehealth bundle; Wearable app marketplace; Apple Health listing; App Store organic; Google Play organic; Creator partnerships; Podcast sponsorship; Newsletter swaps; Search via the wiki; Retreat centres (retreat in a box); Hotel in-room wellness'),
    ('PR', 'Pricing', 'Free week then $10 a month; $79 a year; Lifetime $199; Family plan $14.99 a month; Student $4.99 a month; Employer seat $3 per employee a month; Coin pack of 100; Pay what you can; $1 first month intro; Regional pricing; Win-back 50% off for 3 months; Gift card; Session credit bundle; Clinician licence $49 a month; Retreat in a box $149; Free tier of 3 sessions a week; Plus unlimited; Premium voice add-on; 30% off for annual prepay; Seven-day grace period'),
    ('RL', 'Retention lever', 'Streak with forgiveness; Weekly progress letter; Chapter cliff-hanger; Bedtime reminder; Calendar reminder file; Personal best; Journey completion badge; Day-3 re-engagement push; Email digest; Check-in insight; Seasonal journey; Friend challenge; Live group session; Coach message; Weekly content drop; Save a favourite; Offline downloads; Home-screen widget; Watch complication; Habit-stacking prompt; Pause the subscription; Downgrade instead of cancel; Renewal reminder 7 days ahead; Surprise gift chapter; Milestone celebration; Very-disappointed survey; You-asked-we-shipped note; Community wall; Progress share card; Smart resume'),
    ('UE', 'Unit economics metric', 'Customer acquisition cost; Lifetime value; LTV to CAC ratio; Payback months; Average revenue per user; Gross margin; Generation cost per session; Monthly churn; Trial-to-paid rate; Activation rate; Day-7 retention; Day-30 retention; Referral coefficient; Net promoter score; Sean Ellis score; Refund rate; Support tickets per 1,000 users; Audio cost per minute; Employer seat utilisation; Expansion revenue'),
    ('BF', 'B2B feature', 'Employer admin dashboard; Anonymous aggregate reports; Single sign-on; Bulk access codes; Usage-based billing; Clinician patient assignment; Outcome export; HIPAA readiness; White-label voice; Partner API access; Team challenges; Manager toolkit; Onboarding webinar; Customer success playbook; Renewal health score'),
    ('OB', 'Objection handler', 'Answer to too expensive; Answer to not sure it works; Answer to AI voice feels fake; Answer to no time; Answer to already use another app; Answer to privacy worries; Answer to wanting a human; Answer to forgetting to use it; Answer to it made me sleepy at work; Answer to too spiritual; Answer to not spiritual enough; Answer to my problem is too big; Answer to I tried meditation and failed; Answer to subscription fatigue; Answer to free alternatives on YouTube'),
    ('EX', 'Experiment design', 'Price test $8 vs $10 vs $12; Trial length 7 vs 14 days; Paywall before vs after first session; Annual-first vs monthly-first; Onboarding with vs without voice brief; Reminder on vs off; Personalised first chapter vs generic; Social proof on vs off; Referral reward size; Win-back offer depth; Employer pilot 50 seats; Clinician pilot 10 therapists; Retreat-in-a-box pre-sale; Creator code vs paid ads; Headline test on the landing page'),
]
STAGES = [('VI', 'visit'), ('AC', 'activation'), ('AH', 'aha'), ('UP', 'upgrade'), ('RE', 'retention'), ('RF', 'referral'), ('WB', 'win-back'), ('EX', 'expansion')]

# ---- Brand / marketing: the ReadMe AKP types (his counts in brackets).
BRAND = [
    ('CG', 'Campaign goals', 40, 'Awareness; Trust; Engagement; Consideration; Trial; Conversion; Loyalty; Advocacy; Education; Category creation; Credibility with clinicians; Employer interest; Re-activation; Community growth; Press coverage; Thought leadership; Brand love; Difference from other calm apps; Local launch; Waitlist growth'),
    ('EL', 'Cognitive / emotional levers', 80, 'Authority; Relatability; Storytelling; Social proof; Scarcity; Curiosity gap; Belonging; Hope; Relief; Pride; Nostalgia; Awe; Humour; Vulnerability; Reciprocity; Consistency; Liking; Fear of missing out; Self-efficacy; Identity signalling; Novelty; Simplicity; Warmth; Competence; Transparency; Empathy; Inspiration; Gratitude; Safety; Control'),
    ('FL', 'Functional causal levers', 80, 'Pattern interrupt; Timing hacks; Frequency capping; Retargeting window; First-three-seconds hook; Thumb-stopping visual; Captions on; Sound-off design; Loop ending; Comment-bait question; Duet or stitch prompt; Countdown; Price anchor; Free-week framing; Before and after; Demo in the feed; Native creator voice; Search-intent match; Landing message match; Speed to value; Single call to action; Exit-intent offer; Personalised subject line; Send-time optimisation; Lookalike seed'),
    ('AS', 'Audience affect / cognitive states', 120, 'Curiosity; Scepticism; Overwhelm; Exhaustion; Insomnia frustration; Burnout; Loneliness; Grief; Hopefulness; Restlessness; Self-improvement drive; Price sensitivity; Loyal to another app; Trial fatigue; Distrust of AI; Spiritual seeking; Performance anxiety; New-parent fatigue; Post-breakup; Career transition; Health scare; Seasonal low; New-year motivation; Exam stress; Caregiver strain; Chronic pain; Pre-sleep scrolling; Morning rush; Commute boredom; Weekend reset mood; Ready to buy; Comparing apps; Lapsed user; Champion user; Ready to refer; Clinician-curious; HR buyer; Retreat-goer; Wearable owner; Privacy-conscious'),
    ('GV', 'Long-term growth vectors', 200, 'Trust consistency; Community; Content library depth; Creator partnerships; Compounding search traffic; Referral loop; Employer channel; Clinical evidence; Word of mouth; Brand voice consistency; Strategic partnerships; Localisation; Press relationships; Ambassador programme; User stories; Podcast presence; Newsletter list; Wearable integrations; App Store ranking; Review velocity; Retention-led growth; Annual plan mix; Price perception; Expert advisory board; Research publications; Events and retreats; Seasonal journeys; Gift economy; Family plans; Student market; Therapist network; Corporate case studies; Cultural relevance; Accessibility leadership; Privacy leadership; Design reputation; Voice library ownership; Music library ownership; Outcome data moat; Product-led virality'),
    ('MS', 'Macro strategies', 40, 'Educational; Narrative; Testimonial; Scientific proof; Founder-led; Community-led; Creator-led; Product-led demo; Challenge-based; Seasonal; Comparison; Behind the scenes; Clinical partnership; Cause-related; Experiential retreat; Utility content; Interactive quiz; Humour-led; Minimalist premium; Ritual-building'),
    ('TU', 'Tactical units', 300, 'CTA: start your free week; CTA: hear it now; CTA: build my session; Metaphor: a retreat in your pocket; Meme format: 3am brain; Five-tip carousel; Fifteen-second demo clip; Before and after check-in score; Quote card; Expert stitch; Reply video; Myth versus fact; Day-in-the-life clip; Calm-voice snippet; Voice sample A or B; Breathe-along reel; Countdown sticker; Poll sticker; Welcome email day 1; Nudge email day 3; Trial-ending email day 6; Push: your chapter is ready; Landing hero headline; Social proof bar; Pricing table; FAQ block; Testimonial video; Case study PDF; Webinar; How-to blog post; Wiki article; Sixty-second podcast read; Creator script; User-content brief; Referral card; Gift message; App Store screenshot set; App preview video; Curiosity subject line; Benefit subject line; Hashtag set; Question caption hook; Thread format; Newsletter feature; Press release; Award entry; Partnership one-pager; Sales deck slide; Employer pilot proposal; Clinician handout; QR poster; Retreat flyer; Thank-you card; Sleep diary template; Free mini-course; Quiz result page; Comparison chart; Story highlight; Live session invite; Community AMA'),
    ('AR', 'Story arcs', 100, 'Hero’s journey; Problem to solution; Case study arc; Before and after arc; Day in the life arc; Overcoming the monster; The return; Rebirth; The quest; Voyage and return; The mentor reveals; Underdog; Confession; Myth busting arc; Origin story; Transformation montage; The small win; The sceptic converted; Letter to my past self; Ritual discovery; Night to morning; Storm to calm; Lost and found; Community rescue; Coming home to the body'),
    ('PV', 'Persona voices', 60, 'Guide persona; Mentor persona; Rebel persona; Sage persona; Healer persona; Friend persona; Coach persona; Scientist persona; Poet persona; Elder persona; Big-sister persona; Comedian persona; Monk persona; Nurse persona; Explorer persona; Artist persona; Activist persona; Concierge persona; Storyteller persona; Neighbour persona'),
    ('EA', 'Emotional aesthetics', 100, 'Warm aesthetic; Authoritative aesthetic; Playful aesthetic; Satiric aesthetic; Serene aesthetic; Luxurious aesthetic; Earthy aesthetic; Clinical-clean aesthetic; Dreamy aesthetic; Bold aesthetic; Intimate aesthetic; Nostalgic aesthetic; Minimal aesthetic; Cinematic aesthetic; Handmade aesthetic; Celestial aesthetic; Botanical aesthetic; Urban calm aesthetic; Sunlit aesthetic; Nocturnal aesthetic; Ceremonial aesthetic; Gentle-humour aesthetic; Raw honest aesthetic; Gold premium aesthetic; Soft pastel aesthetic; Monochrome aesthetic; Retro aesthetic; Futuristic aesthetic; Coastal aesthetic; Mountain aesthetic'),
    ('SA', 'Situational anchors', 80, 'New Year; Exam season; World Mental Health Day; Sleep Awareness Week; Daylight saving change; Black Friday; Holiday stress; Back to school; Summer travel; Ramadan; Diwali; Lunar New Year; Mother’s Day; Father’s Day; Valentine’s Day loneliness; Monday morning; Sunday scaries; Full moon; Winter solstice; Spring equinox; Quarter-end at work; Tax season; Wedding season; Graduation; Heatwave nights'),
    ('DE', 'Delivery ecosystems', 80, 'LinkedIn; Instagram; TikTok; YouTube; YouTube Shorts; Pinterest; Reddit; X (Twitter); Threads; Facebook groups; WhatsApp channels; Spotify podcasts; Apple Podcasts; Email newsletter; App Store search; Google Search; Product Hunt; Discord; Substack; Medium; Employer intranet; Clinic waiting-room screen; Retreat venues; Meetup events; Out-of-home posters'),
    ('AK', 'Real-time adaptive knobs', 150, 'Length knob; CTA intensity knob; Persona knob; Tone warmth knob; Humour level knob; Proof density knob; Emoji use knob; Hook type knob; Visual pace knob; Caption length knob; Price mention knob; Urgency level knob; Personalisation depth knob; Reading level knob; Language knob; Music bed knob; Voice gender knob; Thumbnail face or scene knob; Colour temperature knob; Aspect ratio knob; Opening question or statement knob; Number of benefits knob; Testimonial or expert knob; Send time knob; Frequency knob; Offer framing knob; Clinical or spiritual vocabulary knob; Story or list knob; Audience call-out knob; Hashtag count knob; Subtitle style knob; Loop ending knob; Logo timing knob; Discount depth knob; Social proof number knob; Format knob; CTA placement knob; Trust badge knob; Accessibility captions knob; Localisation level knob'),
]
# Which type each type feeds (the ReadMe's cascade, drafted by us).
BRAND_FEEDS = {'EL': 'CG', 'FL': 'TU', 'AS': 'EL', 'GV': 'CG', 'MS': 'CG', 'TU': 'MS', 'AR': 'MS', 'PV': 'MS', 'EA': 'PV', 'SA': 'MS', 'DE': 'TU', 'AK': 'TU'}

# ---- Analysis: Maxwell (resonance and micro-detail) and TheraGPS (therapeutic precision) signals.
ANALYSIS = [
    ('MX', 'MicroBite “Maxwell”', 'Resonance and micro-detail', 'Voice timbre resonance; Tempo resonance; Palette resonance; Script tone resonance; Session length fit; Skip rate per chapter; Replay rate; Chapter completion rate; Drop-off second; Volume adjustments; Pause taps; Seek-back taps; Heart-rate change during a chapter; HRV change during a chapter; Breath rate from the microphone (opt-in); Time to sleep onset; Check-in delta before and after; Thumbs feedback; Favourite saves; Share rate; Recreate rate; Time of day played; Speaker or headphones; Pause-length effect; BPM effect; Voice-pace effect; Imagery theme effect; Breath-pattern effect; Novelty decay; Familiarity effect; Tournament win rate; Champion AKP score; Effect size per AKP; Confidence interval per AKP; Uplift against a control chapter; Effect by identity segment; AKP pair interaction; Attribution share inside a chapter; Exposure count; Regression-to-the-mean guard'),
    ('TG', 'TheraGPS “Governor”', 'Therapeutic precision', 'Starting position score; Distance to the target state; Route chosen; Milestone X reached; Milestone Y reached; Milestone Z reached; Off-route detection; Re-route trigger; Stall detection; Risk flag raised; Crisis escalation; Contraindication check; Window-of-tolerance check; Weekly dose in minutes; Adherence; Readiness-to-change stage; Alliance proxy; Self-efficacy score; Two-item mood screen (opt-in); Two-item anxiety screen (opt-in); Sleep severity item; WHO-5 wellbeing item; Perceived stress item; Loneliness item; Meaning item; Relapse signal; Day-30 maintenance check; Clinician hand-off note; Next-best StateFlip; Plan precision score; Governor veto; Safety rule fired; Evidence level of the route; Personal baseline; Seasonality adjustment; Data sufficiency; Drift alert; Explain-the-route chip; Goal re-confirmation; Progress narrative'),
]


def build_v2(src):
    rows = []

    def add(**r):
        r.setdefault('links', [])
        r.setdefault('dims', [])
        r.setdefault('source', DRAFT)
        r.setdefault('words', r['name'])
        rows.append(r)

    # Voice.
    for code, layer, ident, text in VOICE:
        for i, (name, d) in enumerate(items(text), 1):
            add(id=f'WN-{code}{i:02d}', name=name, family='voice', layer=layer, modality='Voice',
                definition=d or f'A {layer.lower()} setting for the narrator’s voice: {name.lower()}.',
                usedFor=f'the voice of a chapter ({layer.lower()})', helps='the words land in the body, not only the head',
                causal=f'Voice {layer.lower()} sets arousal and trust before any word is understood; it paces breath and attention.',
                signal='Within-chapter A/B: completion, skips in the first 60 s and check-in delta with this setting against the default voice.',
                links=[[ident, 'fed-by']], words=f'{name} {d} {layer} voice calm sleep')

    # Music, image, video: layer instances beyond the sheet's own examples.
    for fam, pre, mod, table, sig in [
        ('music', 'WM', 'Music', MUSIC, 'Heart-rate and HRV change during the chapter (wearable, opt-in) and check-in delta, against the same chapter with the default music.'),
        ('image', 'WI', 'Image', IMAGE, 'Screen dwell, skip rate and check-in delta against the same chapter with another picture.'),
        ('video', 'WV', 'Video', VIDEO, 'Watch-through rate, skips and check-in delta against the same chapter with another clip.'),
    ]:
        used = {}
        for layer, text in table:
            words = [w for w in re.split(r'[^A-Za-z]+', layer) if w]
            code = ''.join(w[0].upper() for w in words)[:3]
            if code in used:  # Visual Methods and Visual Mechanisms are both VM
                code = (code + words[-1][1].upper())[:4]
            used[code] = layer
            g = next((x for x in src['grand4'] if x['modality'] == mod and x['layer'] == layer), None)
            role = g['role'] if g else f'{layer}: drafted by us (the sheet folds colour into its techniques and frameworks).'
            source = f"drafted by us — to review; an instance of Grand 4 layers / {mod} / {layer}" if g else DRAFT
            for i, (name, d) in enumerate(items(text), 101):
                ident = 'ID-L17' if fam == 'music' and 'BPM' in name else 'ID-L18' if 'palette' in name.lower() else ''
                add(id=f'{pre}-{code}{i}', name=name, family=fam, layer=layer, modality=mod,
                    definition=d or f'{layer} ({mod.lower()}): {name}.', usedFor=f'the {mod.lower()} of a chapter ({layer.lower()})',
                    helps='the senses agree with what the words ask for', causal=role, signal=sig, source=source,
                    links=[[ident, 'fed-by']] if ident else [], words=f'{name} {d}')

    # Script layers the v1 draft left empty (Techniques, Archetypes, Styles & Tones, Settings).
    for code, layer, text in SCRIPT:
        g = next(x for x in src['grand4'] if x['modality'] == 'Script' and x['layer'] == layer)
        for i, (name, d) in enumerate(items(text), 1):
            add(id=f'WS-{code}{i:03d}', name=name, family='script', layer=layer, modality='Script',
                definition=d or f'{layer} (script): {name}.', usedFor=f'the words of a chapter ({layer.lower()})', helps='the person do one concrete thing that shifts the state',
                causal=g['role'], signal='Check-in score before and after the chapter, and the rate of reaching the linked StateFlip’s next milestone, against chapters without it.',
                source=f'drafted by us — to review; an instance of Grand 4 layers / Script / {layer}', words=f'{name} {d}')

    # Identity instances.
    light = src['identityLight']
    for idx, text in IDENTITY.items():
        parent = light[idx - 1]['name']
        for i, (name, d) in enumerate(items(text), 1):
            add(id=f'ID-L{idx:02d}-{i}', name=name, family='identity', layer=f'Light · {parent}', modality='—',
                definition=d or f'One value of “{parent}”: {name.lower()}.', usedFor=f'reading who the person is ({parent.lower()})', helps='pick and frame the AKPs that fit this person',
                causal='A value the planner matches AKPs against; a wrong match should lower the check-in delta.',
                signal='Holdout test: check-in delta when AKPs are matched on this value against deliberately unmatched AKPs.',
                links=[[f'ID-L{idx:02d}', 'part-of']], source=f'drafted by us — to review; an instance of Wellness identity workbook / Light / {parent}')

    # Product: ten more per sheet dimension, five extra dimensions, and sheet AKPs applied to our screens.
    prod_names = [(f"PR-{p['id']}", p['name']) for p in src['product']]
    for pre, dim, logic, text in PRODUCT_MORE + PRODUCT_EXTRA:
        start = 9 if any(p['id'].startswith(pre) and p['dimension'] == dim for p in src['product']) else 1
        sheet = start == 9
        for i, (name, d) in enumerate(items(text), start):
            up = best([x for x in prod_names if x[0][3:5] == pre] or prod_names, name, i)
            add(id=f'PR-{pre}{i}', name=name, family='product', layer=dim, modality='—',
                definition=d or f'{dim}: {name}, as Aurelia would build it.', usedFor=f'the app experience ({dim.lower()})', helps='every session feel easy and safe',
                causal=f'{LOGIC[logic]}.', signal='Task success, time to first session and drop-off at this step (click insights), against the build without it.',
                links=[[up, 'mirrors']], source=DRAFT if sheet else f'{DRAFT}; one of five dimensions we added to reach his 18 (his list not received)')
    for p in src['product']:
        lg = SHEET_LOGIC.get(p['dimension'], 2)
        text = f"{p['name']} {p['role']}".lower()
        ranked = sorted(SURFACES, key=lambda s: -sum(w in text for w in SURFACE_WORDS[s[0]].split()))
        k = int(re.sub(r'\D', '', p['id']) or 0)
        picks = ranked[:1] + [s for s in SURFACES[k % 8:] + SURFACES[: k % 8] if s != ranked[0]][:2]
        for code, surface, what in picks:
            add(id=f"PR-{p['id']}-{code}", name=f"{p['name']} on {surface}", family='product', layer=p['dimension'], modality='—',
                definition=f"{p['role']} Applied to {surface} ({what}).", usedFor=f'the {surface} screen', helps='one feature written precisely from the AKP',
                causal=f'{LOGIC[lg]}: the sheet AKP made concrete on one screen.', signal=f'On {surface}: task success, time-on-task and drop-off (click insights) against the screen without it.',
                links=[[f"PR-{p['id']}", 'part-of']], source=f"drafted by us — to review; applies UI/UX product AKPs workbook / {p['dimension']} / {p['id']}")

    # Business.
    sig = {'FS': 'Stage conversion rate against the businessFunnel target.', 'CH': 'CAC, activation and 30-day retention of sign-ups attributed to this channel.',
           'PR': 'Trial-to-paid, 30-day churn and revenue per visitor at this price, in a price test.', 'RL': 'Day-7 and day-30 return of exposed people against a holdout.',
           'UE': 'This is a measure: computed weekly from the funnel and billing data.', 'BF': 'Employer pilot conversion and seat utilisation with the feature.',
           'OB': 'Buyer-agent and real-buyer conversion among people who raised this objection, with and without the answer.', 'EX': 'The experiment’s primary metric against its control.'}
    stage_ids = []
    for code, layer, text in BUSINESS:
        for i, (name, d) in enumerate(items(text), 1):
            rid = f'BZ-{code}{i:02d}'
            if code == 'FS':
                stage_ids.append((rid, name))
            links = [] if code == 'FS' else [[best(stage_ids, f'{name} {d}', i), 'feeds']]
            add(id=rid, name=name, family='business', layer=layer, modality='—', definition=d or f'{layer}: {name}.', usedFor=f'the business ({layer.lower()})',
                helps='more people reach and keep a session that helps', causal=f'Moves a funnel stage: {layer.lower()}.', signal=sig[code], links=links, words=f'{name} {d} {layer}')
    chans = [(f'BZ-CH{i:02d}', n) for i, (n, _) in enumerate(items(BUSINESS[1][2]), 1)]
    stage_for = {'VI': 'BZ-FS01', 'AC': 'BZ-FS02', 'AH': 'BZ-FS03', 'UP': 'BZ-FS06', 'RE': 'BZ-FS08', 'RF': 'BZ-FS09', 'WB': 'BZ-FS07', 'EX': 'BZ-FS06'}
    for cid, cname in chans:
        for scode, stage in STAGES:
            add(id=f'{cid}-{scode}', name=f'{cname}: {stage} play', family='business', layer='Channel × stage play', modality='—',
                definition=f'What we do in the {cname.lower()} channel to move people through {stage}.', usedFor='a go-to-market play', helps=f'{stage} in one channel',
                causal=f'Channel-specific lever on the {stage} stage.', signal=f'{stage.capitalize()} rate of people from this channel against the all-channel average.',
                links=[[cid, 'part-of'], [stage_for[scode], 'feeds']])

    # Brand / marketing.
    ids_by_type = {}
    for code, layer, his, text in BRAND:
        ids_by_type[code] = [(f'BR-{code}{i:03d}', n) for i, (n, _) in enumerate(items(text), 1)]
    for code, layer, his, text in BRAND:
        up = BRAND_FEEDS.get(code)
        for i, (name, d) in enumerate(items(text), 1):
            links = [[best(ids_by_type[up], name, i), 'feeds']] if up else []
            add(id=f'BR-{code}{i:03d}', name=name, family='brand', layer=layer, modality='—', definition=d or f'{layer}: {name}.',
                usedFor=f'marketing ({layer.lower()}; his ReadMe lists {his})', helps='the right person hear about Aurelia in a way they trust',
                causal=f'Marketing AKP type “{layer}”: shapes who notices, believes and tries.', signal='CTR, cost per install and 7-day activation against a control creative; brand-lift survey for trust goals.',
                links=links, source=PENDING_BRAND)

    # Analysis signals.
    for code, owner, layer, text in ANALYSIS:
        for i, (name, d) in enumerate(items(text), 1):
            add(id=f'AN-{code}{i:02d}', name=name, family='analysis', layer=f'{owner} · {layer}', modality='—',
                definition=d or f'{owner}: {name.lower()}.', usedFor=f'measuring ({layer.lower()})', helps='tell which AKPs actually move people',
                causal='A measurement, not a lever: it scores other AKPs in tournaments and guards the route.',
                signal='This is a measure: computed from session events, check-ins and (opt-in) wearable data once real users exist.', words=f'{name} {d}')
    return rows


def main():
    dojo = load('2026-11-26-dojo-objective-learning.xlsx')
    deek = load('2026-11-27-deeksha-objective-learning.xlsx')
    grand = load('2026-11-27-grand-4-layers-akp-master-knowledge.xlsx')
    ident = load('2026-11-27-wellness-identity-akp-first-view.xlsx')
    prod = load('2026-11-27-uiux-product-akps.xlsx')
    bar = load('2026-11-27-bar-elements-operating-model.xlsx')
    src = {'_generated_by': 'scripts/akp/extract.py', '_from': 'docs/briefs/*.xlsx'}

    # Deeksha: 12 pillars (P1-P4 and S1-S11) and the universal needs UN001…
    pillars = []
    for r in deek['12P']:
        if re.match(r'^P\d$', r.get('A', '')) and not r.get('B'):
            pillars.append({'id': r['A'], 'name': r.get('C', ''), 'issues': r.get('F', '')})
        elif re.match(r'^S\d+$', r.get('B', '')):
            pillars.append({'id': r['B'], 'parent': r.get('A', ''), 'name': r.get('C', ''), 'issues': r.get('F', '')})
    src['pillars'] = pillars
    un, p1 = [], ''
    for r in deek['UN']:
        if not re.match(r'^UN\d+$', r.get('C', '')):
            continue
        p1 = r.get('A') or p1
        un.append({'id': r['C'], 'pillar1': p1, 'pillar2': r.get('B', ''), 'obstacle': clean(r.get('E', ''), 120), 'obstacleKw': clean(r.get('F', ''), 30),
                   'wellnessKw': clean(r.get('G', ''), 30), 'headline': clean(r.get('H', ''), 80)})
    # Pillar 2 is only written on the first row of each block.
    last = ''
    for u in un:
        last = u['pillar2'] = u['pillar2'] or last
    src['un'] = unique_ids(un)

    # DOJO: VES, concepts, duals, skills / moods / states / habits.
    src['vesC'] = [{'id': r['A'], 'name': r.get('B', '')} for r in dojo['VES_C'] if re.match(r'^C\d$', r.get('A', ''))][:7]
    src['vesM'] = [{'id': r['A'], 'name': clean(r.get('B', ''), 40)} for r in dojo['VES_M'] if re.match(r'^M\d+$', r.get('A', ''))]
    src['dojoC'] = concepts(dojo['DOJO_C'])
    src['dojoM'] = concepts(dojo['DOJO_M'])
    duals = []
    for r in dojo['DOJO_C_Duals']:
        if not re.match(r'^DI\d+$', r.get('C', '')):
            continue
        duals.append({'id': r['C'], 'ves': r.get('A', ''), 'frame': frame(r.get('B', '')), 'name': clean(r.get('D', ''), 70),
                      'emoIssue': clean(r.get('E', ''), 40), 'emoWell': clean(r.get('G', ''), 40), 'mentIssue': clean(r.get('I', ''), 40),
                      'mentWell': clean(r.get('K', ''), 40), 'physIssue': clean(r.get('M', ''), 40), 'physWell': clean(r.get('O', ''), 40)})
    # The sheet's VES id is only written on some rows; carry it down.
    last = ''
    for d in duals:
        last = d['ves'] = d['ves'] or last
    src['duals'] = unique_ids(duals)
    tables = {'Skill ID': 'skills', 'Mood ID': 'moods', 'State ID': 'states', 'Habit ID': 'habits'}
    cur, db = None, {v: {} for v in tables.values()}
    for r in dojo['DB-skills']:
        if r.get('A') in tables:
            cur = tables[r['A']]
            continue
        if cur and re.match(r'^[A-Z]+\d+$', r.get('A', '')):
            if cur in ('skills', 'habits'):
                db[cur].setdefault(r['A'], {'id': r['A'], 'name': clean(r.get('B', ''), 60), 'role': clean(r.get('C', ''), 160)})
            else:
                db[cur].setdefault(r['A'], {'id': r['A'], 'parent': r.get('B', ''), 'name': clean(r.get('C', ''), 60), 'role': clean(r.get('E', ''), 160)})
    for k, v in db.items():
        src[k] = list(v.values())

    # Grand 4 layers: layer × modality, with the example instances the sheet names.
    g, mod, hier = [], '', ''
    for r in grand['Sheet1']:
        a = r.get('A', '')
        if a == 'Layer' or 'Grand Total' in a:
            break  # the summary table under the four modalities
        if a == 'Modality':
            continue
        if a in ('Script', 'Music', 'Image', 'Video'):
            mod = a
        b = r.get('B', '')
        if b and not re.match(r'^[\d.,~ ]+$', b):
            hier = b
        c = r.get('C', '')
        if not mod or not c or c in ('Subtotal', 'Layer'):
            continue
        g.append({'modality': mod, 'hierarchy': hier, 'layer': clean(c, 60), 'types': r.get('D', ''), 'examples': clean(r.get('E', ''), 120), 'role': clean(r.get('F', ''), 120)})
    src['grand4'] = g

    # Wellness identity: Grand 12 and Light (grouped under their parent rows).
    src['identityGrand'] = [{'name': r['A'], 'types': r.get('B', ''), 'role': clean(r.get('D', ''), 160), 'downstream': clean(r.get('F', ''), 120)}
                            for r in ident['Grand'] if r.get('A') and r.get('A') != 'Dimension']
    light, parent = [], ''
    for r in ident['Light']:
        if not r.get('A') or r['A'] == 'Dimension':
            continue
        try:
            t = float(r.get('B', '0'))
        except ValueError:
            t = 0
        if t >= 15:
            parent = r['A']
            light.append({'name': r['A'], 'parent': '', 'role': clean(r.get('D', ''), 160)})
        else:
            light.append({'name': r['A'], 'parent': parent, 'role': clean(r.get('D', ''), 160)})
    src['identityLight'] = light

    # Product AKPs: the 13 dimension sheets, each row keeps its own ID (UO1, UM2…).
    dims = {r['A'].split('. ', 1)[1]: r for r in prod['Grand'] if re.match(r'^\d+\. ', r.get('A', ''))}
    sheet_dim = {'Outcome': 'UX Outcomes', 'UX mechanics': 'UX Mechanisms', 'Interaction mechanics': 'Interaction Mechanics', 'User states': 'Cognitive User States',
                 'Usage skills': 'Product Usage Skills', 'Navi methods': 'Navigation Methods', 'Interaction techs': 'Interaction Techniques', 'Flow frameworks': 'Flow Frameworks',
                 'Archetypes': 'System Archetypes', 'UI styles & tones': 'UI Styles & Tones', 'Session context': 'Session Contexts', 'Platforms': 'Platform Environments',
                 'dynamic parameters': 'Dynamic Parameters'}
    products = []
    for sheet, dim in sheet_dim.items():
        hdr = prod[sheet][0]
        for r in prod[sheet]:
            if not re.match(r'^[A-Z]{2}\d+$', r.get('A', '')):
                continue
            up = r.get('D', '') if 'Upstream' in hdr.get('D', '') else ''
            products.append({'id': r['A'], 'name': clean(r.get('B', ''), 60), 'dimension': dim, 'role': clean(r.get('C', ''), 140), 'upstream': clean(up, 60),
                             'dimRole': clean(dims.get(dim, {}).get('C', ''), 80)})
    src['product'] = unique_ids(products)

    # BAR elements operating model: bars, elements, script frameworks.
    src['bars'] = unique_ids([{'id': r['A'], 'name': clean(r.get('D', ''), 60), 'segment': r.get('B', ''), 'phase': r.get('C', ''), 'role': clean(r.get('E', ''), 140)}
                              for r in bar['BARS'] if re.match(r'^[A-Z]{2}\d{3}$', r.get('A', ''))])
    src['elements'] = unique_ids([{'id': f"{r['A']} {r['B']}", 'bar': r['A'], 'name': clean(r.get('C', ''), 60), 'section': r.get('D', ''), 'role': clean(r.get('H', ''), 140)}
                                  for r in bar['ELEMENTS'] if re.match(r'^[A-Z]{2}\d{3}$', r.get('A', '')) and r.get('B')])
    src['frameworks'] = [{'id': r['A'], 'name': clean(r.get('B', ''), 60), 'focus': clean(r.get('C', ''), 60), 'role': clean(r.get('E', ''), 140)}
                         for r in bar['Frameworks KB ( improve Element'] if re.match(r'^F\d+$', r.get('A', ''))]

    src['v2'] = build_v2(src)

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// GENERATED by scripts/akp/extract.py from docs/briefs/*.xlsx (U141, J203; v2 rows U150, J208). Do not edit by hand: re-run the script.\n')
        f.write('export const AKP_SOURCE = ')
        json.dump(src, f, ensure_ascii=False, indent=0)
        f.write('\n')
    print({k: len(v) for k, v in src.items() if isinstance(v, list)}, file=sys.stderr)


if __name__ == '__main__':
    main()
