export const runCortexValidation = async () => {
    // This is a client-side snippet to check dataStore content.
    // Copy-paste this into browser console or run via a temporary component
    const { dataStore } = require('@/lib/data-store');
    const { createClient } = require('@/utils/supabase/client');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { console.log("No user"); return; }

    console.log("UserID:", user.id);
    const tasks = await dataStore.getEntries('tasks', user.id);
    const tasks_sb = await dataStore.getEntries('tasks-sb', user.id);

    console.log("Legacy 'tasks' count:", tasks.length);
    console.log("New 'tasks-sb' count:", tasks_sb.length);
    console.log("Sample 'tasks-sb':", tasks_sb[0]);
}
