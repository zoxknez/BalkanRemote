#!/usr/bin/env python3
"""Test new ATS sources from JSON"""
import requests

# Test Greenhouse - GitLab
print("🧪 Testing Greenhouse - GitLab...")
try:
    r = requests.get("https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true", timeout=10)
    jobs = r.json()
    print(f"✅ GitLab: {len(jobs.get('jobs', []))} jobs")
    if jobs.get('jobs'):
        print(f"   Sample: {jobs['jobs'][0]['title']} @ {jobs['jobs'][0]['location']['name']}")
except Exception as e:
    print(f"❌ GitLab error: {e}")

# Test Lever - 1Password
print("\n🧪 Testing Lever - 1Password...")
try:
    r = requests.get("https://api.lever.co/v0/postings/1password?mode=json", timeout=10)
    jobs = r.json()
    print(f"✅ 1Password: {len(jobs)} jobs")
    if jobs:
        print(f"   Sample: {jobs[0]['text']} @ {jobs[0].get('categories', {}).get('location', 'N/A')}")
except Exception as e:
    print(f"❌ 1Password error: {e}")

# Test Workable - Doist
print("\n🧪 Testing Workable - Doist...")
try:
    r = requests.get("https://apply.workable.com/api/v1/widget/accounts/doist/jobs", timeout=10)
    data = r.json()
    jobs = data.get('results', [])
    print(f"✅ Doist: {len(jobs)} jobs")
    if jobs:
        print(f"   Sample: {jobs[0]['title']} @ {jobs[0].get('location', {}).get('city', 'Remote')}")
except Exception as e:
    print(f"❌ Doist error: {e}")

# Test Recruitee - Wallarm
print("\n🧪 Testing Recruitee - Wallarm...")
try:
    r = requests.get("https://wallarm.recruitee.com/api/offers/", timeout=10)
    data = r.json()
    jobs = data.get('offers', [])
    print(f"✅ Wallarm: {len(jobs)} jobs")
    if jobs:
        print(f"   Sample: {jobs[0]['title']} @ {jobs[0].get('location', 'Remote')}")
except Exception as e:
    print(f"❌ Wallarm error: {e}")

print("\n✅ ATS testing complete!")
