SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'schedules', 'visits', 'ratings', 'user_profiles', 'chat_messages')
ORDER BY table_name;
