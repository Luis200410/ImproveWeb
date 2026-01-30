
export const checkMicroapps = async () => {
    const { createClient } = require('@/utils/supabase/client');
    const supabase = createClient();

    // Get unique microapp_ids
    const { data, error } = await supabase
        .from('entries')
        .select('microapp_id, user_id')
        .limit(100);

    if (error) { console.error(error); return; }

    // Group by microapp_id
    const counts: Record<string, number> = {};
    const userIds: Set<string> = new Set();

    data.forEach((row: any) => {
        counts[row.microapp_id] = (counts[row.microapp_id] || 0) + 1;
        userIds.add(row.user_id);
    });

    console.log("Active Microapps in DB:", counts);
    console.log("Distinct Users:", Array.from(userIds));
}
