import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Verify this is a test email just to be safe (starts with test+)
        if (!email.startsWith('test+')) {
            return NextResponse.json({ error: 'Only test emails can be deleted via this route' }, { status: 403 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return NextResponse.json({ error: 'Missing Supabase admin credentials' }, { status: 500 });
        }

        // Create a Supabase client with the service role key to bypass RLS
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // 1. Find the user by email via the Admin API
        // Added pagination to fetch up to 1000 users to ensure the test user is found
        const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (usersError) {
            console.error('Error listing users:', usersError);
            return NextResponse.json({ error: 'Failed to find user' }, { status: 500 });
        }

        const targetUser = usersData.users.find((u) => u.email === email);

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Delete the user
        // Due to ON DELETE CASCADE on our tables (like recipes, meal plans, etc. if configured),
        // deleting the auth.user will automatically clean up associated data.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Successfully deleted user ${email}` });
    } catch (err: any) {
        console.error('Error in teardown API:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
