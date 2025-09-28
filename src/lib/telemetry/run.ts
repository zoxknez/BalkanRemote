import { supabase } from './supabase';

type ScrapeRunRow = { id: string };

export async function startRun(sourceId: string) {
  const { data, error } = await supabase
    .from('scrape_runs')
    .insert({ source_id: sourceId })
    .select()
    .single();
  if (error) throw error;
  return data as ScrapeRunRow;
}

export async function finishRun(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from('scrape_runs')
    .update({ ...patch, ended_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
