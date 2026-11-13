import csv,re,sys,datetime,json,collections
W={'1':1.0,'2':0.8,'3':0.6,'4':0.4,'5':0.2}
T={
 'paywall':("Paywall / free feels less free",[r"paywall",r"used to be free",r"no longer free",r"member(ship)? only",r"pay (to|for)",r"premium",r"subscri",r"price|expensive|\$"]),
 'findability':("Finding things / navigation / clutter",[r"hard to find",r"can'?t find",r"impossible to find",r"navigat",r"clutter",r"overwhelm",r"too many",r"recently played",r"\bhistory\b",r"search"]),
 'redesign':("Redesign / update made it worse",[r"new (update|version|design|layout|ui|interface)",r"redesign",r"bring back",r"old version",r"since the (latest |last |recent )?update",r"latest update"]),
 'bugs':("Bugs, crashes, login",[r"crash",r"\bbug",r"glitch",r"freez",r"won'?t (load|open|play)",r"log ?in",r"sign ?in"]),
 'player':("Player, offline, audio stops",[r"offline",r"download",r"\bplayer\b",r"stops? playing|cuts? out|pauses",r"background",r"skip|rewind|fast forward"]),
 'timer':("The timer, bells, intervals",[r"\btimer\b",r"\bbells?\b",r"interval"]),
 'progress':("Stats, streaks, milestones",[r"streak",r"\bstats?\b",r"milestone",r"consecutive",r"lost (my )?(streak|stats|history|days|data)"]),
 'community':("Community, groups, live, teachers",[r"communit",r"\bgroups?\b",r"\blive\b",r"teacher",r"friend"]),
 'quality':("Uneven content quality",[r"quality",r"amateur",r"background noise",r"voice"]),
 'spiritual':("Too spiritual / religious / woo",[r"\bwoo",r"religio",r"spiritual",r"new ?age",r"manifest",r"chakra"]),
 'notifications':("Notifications / spam",[r"notification",r"spam",r"emails?\b",r"messages? from"]),
 'personal':("Personalisation / recommendations",[r"recommend",r"personali",r"tailor",r"algorithm"]),
 'ads_ai':("AI content / ads",[r"\bai\b",r"artificial",r"\bads?\b|advert"]),
 'sleep':("USE: sleep",[r"sleep",r"insomnia"]),
 'anxiety':("USE: anxiety & stress",[r"anxi",r"stress",r"panic",r"depress"]),
}
REQ=[r"\bi wish\b",r"\bplease (add|bring|make|let|fix)\b",r"would (be|love)",r"\bno way to\b",r"\bdoesn'?t (have|let|allow)\b",r"\bmissing\b",r"\bwhy (can'?t|isn'?t|doesn'?t)\b",r"\bit would be\b"]
rows=list(csv.DictReader(open(sys.argv[1])))
today=datetime.date(2026,11,13)
res={k:{'n':0,'low':0,'score':0.0,'quotes':[]} for k in T}
reqs=[]
for r in rows:
  t=re.sub(r'insight ?timer','IT',r['text'],flags=re.I);low=r['rating'] in('1','2')
  w=W.get(r['rating'],0.6)
  d=datetime.date.fromisoformat(r['date'])
  if (today-d).days>548: w/=2
  for k,(lab,pats) in T.items():
    if any(re.search(p,t,re.I) for p in pats):
      x=res[k];x['n']+=1;x['low']+=low;x['score']+=w
      if low or r['rating']=='3': x['quotes'].append((r['date'],r['rating'],r['source'],t))
  for s in re.split(r'(?<=[.!?])\s+',t):
    if any(re.search(p,s,re.I) for p in REQ): reqs.append((r['date'],r['rating'],s.strip()))
print("total",len(rows))
for k,x in sorted(res.items(),key=lambda kv:-kv[1]['score']):
  print(f"{k:14} score={x['score']:6.1f} n={x['n']:4} low={x['low']:3}  {T[k][0]}")
json.dump({'res':res,'reqs':reqs},open(sys.argv[2],'w'))
