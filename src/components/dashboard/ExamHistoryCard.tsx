import { Calendar, Clock, ChevronRight, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { ExamSession } from '@/hooks/useExamHistory';

interface ExamHistoryCardProps {
  session: ExamSession;
  onClick: () => void;
}

export function ExamHistoryCard({ session, onClick }: ExamHistoryCardProps) {
  const getStatusConfig = (status: ExamSession['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Tamamlandı',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'in_progress':
        return {
          label: 'Devam Ediyor',
          icon: PlayCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'exited':
        return {
          label: 'Çıkıldı',
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
      default:
        return {
          label: 'Beklemede',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
    }
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const timeAgo = (dateStr: string): string => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: tr });
    } catch {
      return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-thy-red/30 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </span>
            {session.status === 'in_progress' && (
              <span className="text-xs text-gray-500">
                Soru {session.current_question_number}/{session.total_questions}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            İngilizce Speaking Sınavı
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {timeAgo(session.created_at)}
            </span>
            {session.completed_at && session.created_at && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.round((new Date(session.completed_at).getTime() - new Date(session.created_at).getTime()) / 60000)} dk
              </span>
            )}
          </div>
        </div>

        {session.status === 'completed' && session.overall_score !== null && (
          <div className="text-right ml-4">
            <div className={`text-3xl font-bold ${getScoreColor(session.overall_score)}`}>
              {Math.round(session.overall_score)}
            </div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
        )}
      </div>

      {/* Score Breakdown (if completed) */}
      {session.status === 'completed' && session.overall_score !== null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Akıcılık', score: session.fluency_score },
            { label: 'Dilbilgisi', score: session.grammar_score },
            { label: 'Kelime', score: session.vocabulary_score },
            { label: 'Telaffuz', score: session.pronunciation_score },
          ].map((skill, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{skill.label}</div>
              <div className={`text-sm font-semibold ${skill.score !== null ? getScoreColor(skill.score) : 'text-gray-400'}`}>
                {skill.score !== null ? Math.round(skill.score) : '-'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {formatDate(session.created_at)}
        </span>
        <span className="text-sm font-medium text-thy-red group-hover:text-thy-darkRed transition-colors flex items-center gap-1">
          Detayları Gör
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </button>
  );
}

