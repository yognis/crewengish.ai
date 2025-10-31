-- =====================================================
-- FIX USER COUNT FEATURE - RLS POLICIES
-- =====================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- =====================================================

-- 1. PROFILES TABLOSU - Toplam üye sayısı için
-- =====================================================

-- RLS'i aktifleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eski policy varsa sil
DROP POLICY IF EXISTS "Allow public to count profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profile count" ON profiles;

-- Herkesin profil sayısını görmesine izin ver (SELECT için)
-- NOT: Bu sadece COUNT için, kişisel bilgiler görünmez
CREATE POLICY "Allow public to count profiles"
ON profiles
FOR SELECT
USING (true);

-- Realtime için policy
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- 2. EXAM_SESSIONS TABLOSU - Bugünkü sınav sayısı için
-- =====================================================

-- RLS'i aktifleştir
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- Eski policy varsa sil
DROP POLICY IF EXISTS "Allow public to count exam sessions" ON exam_sessions;
DROP POLICY IF EXISTS "Anyone can view exam count" ON exam_sessions;

-- Herkesin sınav sayısını görmesine izin ver
CREATE POLICY "Allow public to count exam sessions"
ON exam_sessions
FOR SELECT
USING (true);

-- Realtime için policy
ALTER TABLE exam_sessions REPLICA IDENTITY FULL;

-- 3. REALTIME'I AKTİFLEŞTİR
-- =====================================================

-- Realtime için publication oluştur
DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- 4. KONTROL: Kaç üye var?
-- =====================================================

SELECT
    'Toplam Üye Sayısı' as metric,
    COUNT(*) as count
FROM profiles

UNION ALL

SELECT
    'Bugün Başlatılan Sınavlar' as metric,
    COUNT(*) as count
FROM exam_sessions
WHERE created_at >= CURRENT_DATE;

-- 5. POLİCY KONTROLÜ
-- =====================================================

SELECT
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('profiles', 'exam_sessions')
ORDER BY tablename, policyname;

-- =====================================================
-- BAŞARILI! Şimdi:
-- 1. Dashboard'u yenileyin (F5)
-- 2. Browser Console'u açın (F12)
-- 3. "Total users count: X" mesajını görmelisiniz
-- =====================================================
