'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, TrendingUp, Zap, Trophy, Sparkles, ArrowLeft } from 'lucide-react';
import { formatUserCount } from '@/hooks/useTotalUsers';

interface CommunityStats {
  totalUsers: number;
  activeToday: number;
  totalExams: number;
}

interface RecentActivity {
  id: string;
  userName: string;
  score: number;
  timeAgo: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    activeToday: 0,
    totalExams: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchCommunityData = async () => {
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch today's active users
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: activeCount } = await supabase
          .from('exam_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Fetch total exams
        const { count: examsCount } = await supabase
          .from('exam_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        setStats({
          totalUsers: usersCount ?? 0,
          activeToday: activeCount ?? 0,
          totalExams: examsCount ?? 0,
        });

        // Fetch recent completed exams with user info
        const { data: recentExams } = await supabase
          .from('exam_sessions')
          .select(`
            id,
            total_score,
            created_at,
            profiles!inner (
              first_name,
              last_name
            )
          `)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentExams) {
          const activities = recentExams.map((exam: any) => {
            const timeDiff = Date.now() - new Date(exam.created_at).getTime();
            const minutesAgo = Math.floor(timeDiff / 60000);

            let timeAgo = '';
            if (minutesAgo < 1) timeAgo = 'Az önce';
            else if (minutesAgo < 60) timeAgo = `${minutesAgo} dk önce`;
            else if (minutesAgo < 1440) timeAgo = `${Math.floor(minutesAgo / 60)} saat önce`;
            else timeAgo = `${Math.floor(minutesAgo / 1440)} gün önce`;

            return {
              id: exam.id,
              userName: `${exam.profiles.first_name} ${exam.profiles.last_name?.charAt(0)}.`,
              score: Math.round(exam.total_score),
              timeAgo,
            };
          });
          setRecentActivity(activities);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching community data:', error);
        setLoading(false);
      }
    };

    fetchCommunityData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('community-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'exam_sessions',
        },
        () => {
          fetchCommunityData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchCommunityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-thy-lightGray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-thy-red mx-auto mb-4"></div>
          <p className="text-gray-600">Topluluk yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-thy-lightGray">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-thy-red hover:text-thy-darkRed transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Dashboard'a Dön</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-thy-red/10 rounded-xl mb-6">
            <Sparkles className="w-8 h-8 text-thy-red" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            CrewEnglish.ai Topluluğu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Havacılık profesyonellerinin İngilizce öğrenme topluluğuna hoş geldin!
            Binlerce kullanıcı her gün AI ile pratik yapıyor.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Members */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-thy-red transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatUserCount(stats.totalUsers)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Toplam Üye</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Dünya çapında havacılık profesyonelleri topluluğumuzda
            </p>
          </div>

          {/* Active Today */}
          <div className="bg-white rounded-xl p-6 border-2 border-thy-red hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-thy-red/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-thy-red" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-thy-red">
                  {formatUserCount(stats.activeToday)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Bugün Aktif</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm flex items-center">
              🔥 Bugün sınav yapan kullanıcılar
            </p>
          </div>

          {/* Total Exams */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-thy-red transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatUserCount(stats.totalExams)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Toplam Sınav</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Topluluğumuz tarafından tamamlanan sınavlar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center mb-6">
              <Trophy className="w-5 h-5 text-thy-red mr-2" />
              <h2 className="text-xl font-bold text-gray-900">
                Son Başarılar
              </h2>
              <span className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="ml-2 text-xs text-green-600 font-medium">Canlı</span>
            </div>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Henüz tamamlanmış sınav yok
                </p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-thy-lightGray rounded-lg hover:bg-gray-100 transition-colors"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-thy-red rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {activity.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {activity.userName}
                        </p>
                        <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-thy-red">
                        {activity.score}
                      </div>
                      <div className="text-xs text-gray-500">puan</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              Sen de Katıl! 🚀
            </h2>
            <p className="text-gray-600 mb-6">
              Havacılık kariyerin için İngilizce'ni geliştir. AI destekli sınavlarla
              konuşma, dilbilgisi ve telaffuzunu ölç!
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-5 h-5 bg-thy-red/10 rounded flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-thy-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>20 soruluk kapsamlı değerlendirme</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-5 h-5 bg-thy-red/10 rounded flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-thy-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Anında AI geri bildirimi</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-5 h-5 bg-thy-red/10 rounded flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-thy-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Detaylı performans analizi</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/exam/start')}
              className="w-full bg-thy-red hover:bg-thy-darkRed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              İlk Sınavını Başlat →
            </button>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mt-8 bg-white rounded-xl p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-5 h-5 text-thy-red mr-2" />
            Topluluk Kilometre Taşları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-thy-lightGray rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalUsers >= 100 ? '✓' : formatUserCount(stats.totalUsers) + '/100'}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">İlk 100 Üye</div>
            </div>
            <div className="text-center p-4 bg-thy-lightGray rounded-lg">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalUsers >= 1000 ? '✓' : formatUserCount(stats.totalUsers) + '/1K'}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">1,000 Üye</div>
            </div>
            <div className="text-center p-4 bg-thy-lightGray rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalExams >= 10000 ? '✓' : formatUserCount(stats.totalExams) + '/10K'}
              </div>
              <div className="text-xs text-gray-600 font-medium mt-1">10,000 Sınav</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
