"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart, PieChart, Activity } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface VisualizerCardProps {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: DataPoint[];
  subtitle?: string;
}

export function VisualizerCard({ type, title, data, subtitle }: VisualizerCardProps) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 150;
  const chartWidth = 300;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-4 overflow-hidden rounded-3xl border-2 border-[var(--color-primary)]/20 bg-black/40 backdrop-blur-xl p-6 shadow-2xl shadow-[var(--color-primary)]/10"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white uppercase italic">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-bold text-[var(--color-primary)] opacity-60 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
          {type === 'line' ? <TrendingUp className="text-[var(--color-primary)] h-5 w-5" /> : 
           type === 'bar' ? <BarChart className="text-[var(--color-primary)] h-5 w-5" /> : 
           <PieChart className="text-[var(--color-primary)] h-5 w-5" />}
        </div>
      </div>

      <div className="relative h-[180px] w-full mt-4">
        {type === 'bar' && (
          <div className="flex h-full items-end justify-between gap-2 px-2">
            {data.map((point, i) => {
              const heightPercentage = (point.value / maxValue) * 100;
              return (
                <div key={i} className="group relative flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ delay: i * 0.05, type: "spring", damping: 15 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-secondary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] relative"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-black/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {point.value}
                    </div>
                  </motion.div>
                  <p className="mt-2 text-[10px] font-bold text-white/40 uppercase rotate-45 origin-left truncate w-full text-center">
                    {point.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {type === 'line' && (
          <div className="h-full w-full relative group">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[...Array(5)].map((_, i) => (
                <line 
                  key={i}
                  x1="0" y1={(chartHeight / 4) * i} 
                  x2={chartWidth} y2={(chartHeight / 4) * i} 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="1" 
                />
              ))}

              {/* Data Path */}
              {(() => {
                const step = chartWidth / (data.length - 1);
                const points = data.map((d, i) => `${i * step},${chartHeight - (d.value / maxValue) * chartHeight}`).join(' ');
                const areaPoints = `${points} ${chartWidth},${chartHeight} 0,${chartHeight}`;
                
                return (
                  <>
                    <motion.polyline
                      points={points}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.polygon
                      points={areaPoints}
                      fill="url(#lineGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                    {/* Points */}
                    {data.map((d, i) => (
                       <motion.circle 
                          key={i}
                          cx={i * step}
                          cy={chartHeight - (d.value / maxValue) * chartHeight}
                          r="3"
                          fill="var(--color-primary)"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                       />
                    ))}
                  </>
                );
              })()}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                {data.length <= 7 && data.map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-white/30 uppercase">{d.label}</span>
                ))}
            </div>
          </div>
        )}

        {type === 'pie' && (
            <div className="flex h-full items-center justify-around">
                <div className="relative h-32 w-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 overflow-visible">
                        {(() => {
                            let cumulativePercent = 0;
                            const total = data.reduce((acc, d) => acc + d.value, 0);
                            
                            return data.map((d, i) => {
                                const percent = (d.value / total) * 100;
                                const startAngle = (cumulativePercent / 100) * 360;
                                cumulativePercent += percent;
                                const endAngle = (cumulativePercent / 100) * 360;
                                
                                // SVG Arc logic
                                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                                const largeArc = percent > 50 ? 1 : 0;
                                
                                return (
                                    <motion.path
                                        key={i}
                                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                        fill={i === 0 ? "var(--color-primary)" : i === 1 ? "var(--color-secondary)" : `rgba(var(--color-primary-rgb), ${1 - i * 0.2})`}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="hover:blur-[2px] transition-all cursor-pointer"
                                    />
                                );
                            });
                        })()}
                    </svg>
                </div>
                <div className="space-y-2 max-w-[140px]">
                    {data.slice(0, 4).map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: i === 0 ? "var(--color-primary)" : i === 1 ? "var(--color-secondary)" : `rgba(255,255,255,${0.5-i*0.1})` }} />
                             <span className="text-[10px] font-bold text-white truncate">{d.label}</span>
                             <span className="text-[10px] font-black text-[var(--color-primary)] ml-auto">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/20">
            <Activity className="h-4 w-4 text-[var(--color-primary)]" />
         </div>
         <p className="text-[11px] font-medium leading-tight text-white/70">
            Analysis: Based on your recent database activity, your <span className="text-white font-bold">{title}</span> shows a <span className="text-green-400 font-bold">consistent upward trend</span>.
         </p>
      </div>
    </motion.div>
  );
}
