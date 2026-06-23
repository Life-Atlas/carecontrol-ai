-- Check if the CareControl tables have any data (they shouldn't - freshly created)
SELECT 'profiles' as tbl, count(*) as cnt FROM public.profiles
UNION ALL
SELECT 'schedules', count(*) FROM public.schedules
UNION ALL
SELECT 'visits', count(*) FROM public.visits
UNION ALL
SELECT 'ratings', count(*) FROM public.ratings
UNION ALL
-- Check if key Life Atlas tables still have data
SELECT 'user_profiles', count(*) FROM public.user_profiles
UNION ALL
SELECT 'chat_messages', count(*) FROM public.chat_messages
UNION ALL
SELECT 'timeline_entries', count(*) FROM public.timeline_entries;
