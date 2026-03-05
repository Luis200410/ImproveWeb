import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('entries').select('*').eq('microapp_id', 'atomic-habits').limit(10);
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data.map(d => ({
            id: d.id,
            data: d.data
        })), null, 2));
    }
}

run();
