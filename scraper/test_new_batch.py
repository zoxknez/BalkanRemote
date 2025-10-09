#!/usr/bin/env python3
"""Quick test of new ATS sources"""
import requests

sources = [
    ("Remote.com", "https://boards-api.greenhouse.io/v1/boards/remotecom/jobs?content=true", "jobs"),
    ("Mozilla", "https://boards-api.greenhouse.io/v1/boards/mozilla/jobs?content=true", "jobs"),
    ("BitGo", "https://boards-api.greenhouse.io/v1/boards/bitgo/jobs?content=true", "jobs"),
    ("Mercury", "https://boards-api.greenhouse.io/v1/boards/mercury/jobs?content=true", "jobs"),
    ("Welocalize", "https://api.lever.co/v0/postings/welocalize?mode=json", None),
    ("Ro", "https://api.lever.co/v0/postings/ro?mode=json", None),
    ("AwesomeMotive", "https://apply.workable.com/api/v1/widget/accounts/awesomemotive/jobs", "results"),
    ("Tiugo", "https://tiugotech.recruitee.com/api/offers/", "offers"),
    ("Nokia", "https://api.smartrecruiters.com/v1/companies/nokia/postings", "content"),
]

total = 0
for name, url, key in sources:
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        count = len(data[key]) if key else len(data)
        total += count
        print(f"✅ {name:20s} {count:4d} jobs")
    except Exception as e:
        print(f"❌ {name:20s} Error: {str(e)[:50]}")

print(f"\n🎯 Total new jobs: {total}")
print(f"📊 Current + New = 812 + {total} = {812 + total}")
