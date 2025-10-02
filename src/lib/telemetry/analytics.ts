declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Google Analytics tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
  }
};

export const event = (
  action: string,
  parameters: {
    event_category?: string;
    event_label?: string;
    value?: number;
    custom_parameters?: Record<string, unknown>;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: parameters.event_category,
      event_label: parameters.event_label,
      value: parameters.value,
      ...parameters.custom_parameters,
    });
  }
};

// Specific tracking functions for RemoteBalkan
export const trackJobView = (jobId: string, source: string) => {
  event('view_job', {
    event_category: 'engagement',
    event_label: source,
    custom_parameters: {
      job_id: jobId,
      source,
    },
  });
};

export const trackJobApply = (jobId: string, source: string, external_url: string) => {
  event('apply_job', {
    event_category: 'conversion',
    event_label: source,
    value: 1,
    custom_parameters: {
      job_id: jobId,
      source,
      external_url,
    },
  });
};

export const trackSearch = (query: string, filters: Record<string, unknown>) => {
  event('search', {
    event_category: 'engagement',
    event_label: query,
    custom_parameters: {
      search_term: query,
      filters: JSON.stringify(filters),
    },
  });
};

export const trackBookmark = (jobId: string, action: 'add' | 'remove') => {
  event(`bookmark_${action}`, {
    event_category: 'engagement',
    custom_parameters: {
      job_id: jobId,
    },
  });
};

export const trackSourceClick = (sourceName: string, sourceUrl: string) => {
  event('source_click', {
    event_category: 'engagement',
    event_label: sourceName,
    custom_parameters: {
      source_name: sourceName,
      source_url: sourceUrl,
    },
  });
};

export const trackToolUsage = (toolName: string) => {
  event('tool_usage', {
    event_category: 'engagement',
    event_label: toolName,
    custom_parameters: {
      tool_name: toolName,
    },
  });
};
