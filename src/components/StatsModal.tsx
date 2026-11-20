import { Modal } from "./Modal";
import type { Stats } from "../hooks/useStats";

interface StatsModalProps {
  stats: Stats;
  boardCount: number;
  onClose: () => void;
}

export function StatsModal({ stats, boardCount, onClose }: StatsModalProps) {
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDistribution = Math.max(1, ...stats.distribution);

  return (
    <Modal title="Estatísticas" onClose={onClose}>
      <div className="grid grid-cols-4 gap-2 rounded-lg bg-white/[3%] p-3 text-center">
        <Stat label="Jogadas" value={stats.played} />
        <Stat label="% Vitórias" value={winRate} />
        <Stat label="Sequência atual" value={stats.currentStreak} />
        <Stat label="Melhor sequência" value={stats.maxStreak} />
      </div>

      <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        Distribuição de tentativas
      </h3>
      <div className="flex flex-col gap-1.5">
        {stats.distribution.map((count, index) => {
          const widthPercent = Math.max(8, (count / maxDistribution) * 100);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-3 font-semibold text-[var(--color-text-muted)]">
                {index + 1}
              </span>
              <div className="flex-1">
                <div
                  className="flex min-w-[26px] items-center justify-end rounded-md bg-[var(--color-correct)] px-2 py-1 font-semibold text-white transition-[width] duration-500 ease-out"
                  style={{ width: `${widthPercent}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-[var(--color-text-faint)]">
        {boardCount === 1
          ? "As estatísticas consideram apenas a palavra do dia."
          : `As estatísticas consideram apenas as palavras do dia do modo de ${boardCount} palavras.`}
      </p>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase leading-tight text-[var(--color-text-muted)]">
        {label}
      </div>
    </div>
  );
}
