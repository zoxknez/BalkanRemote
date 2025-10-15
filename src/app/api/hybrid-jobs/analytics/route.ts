import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Analytics tracking for hybrid jobs
export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json()
    
    // Validate event type
    const validEvents = [
      'source_click',
      'filter_used',
      'search_performed',
      'bookmark_added',
      'bookmark_removed',
      'job_clicked',
      'page_view'
    ]
    
    if (!validEvents.includes(event)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid event type' 
      }, { status: 400 })
    }

    // Log analytics event (in production, send to analytics service)
    console.log('Analytics Event:', {
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
          request.headers.get('x-real-ip')
    })

    // In production, you would send this to your analytics service:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom analytics service

    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    })
  } catch (err) {
    console.error('Analytics tracking error:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track event' 
    }, { status: 500 })
  }
}

// Get analytics summary (for stats tab)
export async function GET(_request: NextRequest) {
  try {
    // In production, this would fetch from your analytics database
    // For now, return mock data
    const mockStats = {
      totalViews: 1250,
      totalClicks: 340,
      topSources: [
        { name: 'RemoteOK', clicks: 120 },
        { name: 'WeWorkRemotely', clicks: 95 },
        { name: 'Jobicy', clicks: 80 },
        { name: 'Remotive', clicks: 45 }
      ],
      topFilters: [
        { name: 'Remote', usage: 280 },
        { name: 'Full-time', usage: 195 },
        { name: 'Senior', usage: 150 },
        { name: 'Frontend', usage: 120 }
      ],
      searchQueries: [
        { query: 'react', count: 45 },
        { query: 'javascript', count: 38 },
        { query: 'python', count: 32 },
        { query: 'remote', count: 28 }
      ]
    }

    return NextResponse.json({ 
      success: true, 
      data: mockStats 
    })
  } catch (err) {
    console.error('Analytics fetch error:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    }, { status: 500 })
  }
}

