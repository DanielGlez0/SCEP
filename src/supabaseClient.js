import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpzfdzdhyapihphfcqas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwemZkemRoeWFwaWhwaGZjcWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODExMTIsImV4cCI6MjA2MTk1NzExMn0.ddbIvUbkYavp7kV0gmo5FMuFLLAioK_3pJWv_PucryI';
export const supabase = createClient(supabaseUrl, supabaseKey);
