import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { DayRating } from '../types';

interface StateDynamicsChartProps {
  days: Record<string, DayRating>;
  daysRange?: number;
  showPeriodSelector?: boolean;
}

type ChartType = 'line' | 'bar' | 'pie';

const METRIC_COLORS = {
  craving: '#EF4444',  // Червоний
  energy: '#10B981',   // Смарагдовий
  calmness: '#6366F1', // Індиго
  focus: '#8B5CF6',    // Фіолетовий
  sleep: '#06B6D4',    // Блакитний (Cyan)
  sex: '#EC4899'       // Яскраво-рожевий (Hot Pink)
};

export const StateDynamicsChart: React.FC<StateDynamicsChartProps> = ({
  days,
  daysRange = 7,
  showPeriodSelector = true
}) => {
  const [selectedRange, setSelectedRange] = useState<number>(daysRange);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Chart data for Line and Bar charts
  const chartData = useMemo(() => {
    const points = [];
    const today = new Date();

    for (let i = selectedRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const dayRating = days[dateKey];

      const weekday = d.toLocaleDateString('uk-UA', { weekday: 'short' });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const dayMonth = d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
      const monthOnly = d.toLocaleDateString('uk-UA', { month: 'short' });

      let displayLabel = capitalizedWeekday;
      if (selectedRange > 7 && selectedRange <= 30) {
        displayLabel = `${d.getDate()} ${monthOnly}`;
      } else if (selectedRange > 30 && selectedRange <= 90) {
        displayLabel = `${d.getDate()} ${monthOnly}`;
      } else if (selectedRange > 90) {
        displayLabel = `${monthOnly}`;
      }

      const surveys = dayRating?.surveys || dayRating?.entries || [];
      const hasSurveys = surveys.length > 0;

      const calcAvg = (key: 'craving' | 'energy' | 'balance' | 'mood' | 'focus') => {
        if (!hasSurveys) return null;
        let sum = 0;
        let count = 0;
        surveys.forEach((s) => {
          const val = (s as any)[key];
          if (typeof val === 'number' && val > 0) {
            sum += val;
            count++;
          }
        });
        return count > 0 ? Number((sum / count).toFixed(1)) : null;
      };

      const cravingVal = calcAvg('craving') ?? dayRating?.craving ?? null;
      const energyVal = calcAvg('energy') ?? null;
      const calmnessVal = calcAvg('balance') ?? calcAvg('mood') ?? dayRating?.mood ?? null;
      const focusVal = calcAvg('focus') ?? null;

      const sleepHours = dayRating?.sleep?.hours ?? null;
      const mealsCount = dayRating?.meals?.length ?? 0;
      const drinksCount = dayRating?.drinks?.length ?? 0;

      const sexEntries = surveys.filter(
        (s) => s.id?.startsWith('sex_') || s.note?.includes('Секс') || s.note?.includes('Близькість')
      );
      const sexCount = sexEntries.length > 0 ? sexEntries.length : null;

      const hasAnyData = hasSurveys || dayRating?.sleep || mealsCount > 0 || drinksCount > 0 || cravingVal !== null;

      points.push({
        dateKey,
        displayLabel,
        fullDate: `${capitalizedWeekday}, ${dayMonth} ${d.getFullYear()}`,
        hasData: hasAnyData,
        craving: cravingVal,
        energy: energyVal,
        calmness: calmnessVal,
        focus: focusVal,
        sleepHours,
        sexCount,
        surveysCount: surveys.length
      });
    }

    return points;
  }, [days, selectedRange]);

  // Aggregated averages for Pie chart
  const pieData = useMemo(() => {
    let cravingSum = 0, cravingCount = 0;
    let energySum = 0, energyCount = 0;
    let calmnessSum = 0, calmnessCount = 0;
    let focusSum = 0, focusCount = 0;
    let sleepSum = 0, sleepCount = 0;
    let sexSum = 0;

    chartData.forEach((p) => {
      if (p.craving !== null) { cravingSum += p.craving; cravingCount++; }
      if (p.energy !== null) { energySum += p.energy; energyCount++; }
      if (p.calmness !== null) { calmnessSum += p.calmness; calmnessCount++; }
      if (p.focus !== null) { focusSum += p.focus; focusCount++; }
      if (p.sleepHours !== null) { sleepSum += p.sleepHours; sleepCount++; }
      if (p.sexCount !== null) { sexSum += p.sexCount; }
    });

    const items = [
      { name: 'Тяга', value: cravingCount > 0 ? Number((cravingSum / cravingCount).toFixed(1)) : 0, color: METRIC_COLORS.craving, unit: '/10' },
      { name: 'Енергія', value: energyCount > 0 ? Number((energySum / energyCount).toFixed(1)) : 0, color: METRIC_COLORS.energy, unit: '/10' },
      { name: 'Спокій', value: calmnessCount > 0 ? Number((calmnessSum / calmnessCount).toFixed(1)) : 0, color: METRIC_COLORS.calmness, unit: '/10' },
      { name: 'Фокус', value: focusCount > 0 ? Number((focusSum / focusCount).toFixed(1)) : 0, color: METRIC_COLORS.focus, unit: '/10' },
      { name: 'Сон', value: sleepCount > 0 ? Number((sleepSum / sleepCount).toFixed(1)) : 0, color: METRIC_COLORS.sleep, unit: 'г' },
      { name: 'Секс', value: sexSum > 0 ? sexSum : 0, color: METRIC_COLORS.sex, unit: 'раз' },
    ];

    return items.filter((item) => item.value > 0);
  }, [chartData]);

  // Determine tick interval for XAxis so labels don't crowd
  const xAxisInterval = useMemo(() => {
    if (selectedRange <= 7) return 0;
    if (selectedRange <= 14) return 1;
    if (selectedRange <= 30) return 4;
    if (selectedRange <= 90) return 14;
    if (selectedRange <= 180) return 29;
    return 30;
  }, [selectedRange]);

  const getRangeTitle = () => {
    switch (selectedRange) {
      case 7: return '7 днів';
      case 30: return '1 місяць';
      case 90: return '3 місяці';
      case 180: return '6 місяців';
      case 365: return '1 рік';
      default: return `${selectedRange} днів`;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
      {/* Top Controls: Title, Chart Mode Switcher and Range Selector */}
      <div className="flex flex-col gap-2.5 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
              Динаміка стану
            </h3>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Графічне розбиття показників
            </p>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-[#E6F0EC] dark:bg-[#25252d] rounded-xl border border-[#B7CDC6]/30">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-[#121212] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
                  : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
              }`}
              title="Лінійний графік"
            >
              📈 Лінії
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-[#121212] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
                  : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
              }`}
              title="Стовпчикова діаграма"
            >
              📊 Стовпчики
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-[#121212] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
                  : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
              }`}
              title="Колова діаграма"
            >
              🥧 Колова
            </button>
          </div>
        </div>

        {/* Time range switcher */}
        {showPeriodSelector && (
          <div className="flex items-center justify-between gap-2">
            <div className="grid grid-cols-5 gap-1 p-1 bg-[#E6F0EC] dark:bg-[#25252d] rounded-xl w-full border border-[#B7CDC6]/30 dark:border-white/5 no-scrollbar">
              {[
                { r: 7, label: '7 дн' },
                { r: 30, label: '1 міс' },
                { r: 90, label: '3 міс' },
                { r: 180, label: '6 міс' },
                { r: 365, label: '1 рік' }
              ].map(({ r, label }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRange(r)}
                  className={`py-1 text-[10px] font-semibold rounded-lg text-center transition-all cursor-pointer ${
                    selectedRange === r
                      ? 'bg-white dark:bg-[#121212] text-[#12302B] dark:text-[#f4f4f5] shadow-xs font-bold'
                      : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-bold text-[#1E8A69] dark:text-[#4CC9A0] bg-[#1E8A69]/10 px-2 py-1 rounded-lg shrink-0">
              {getRangeTitle()}
            </span>
          </div>
        )}
      </div>

      {/* Chart container */}
      <div className="h-56 w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#B7CDC6" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="displayLabel"
                stroke="#55726B"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval={xAxisInterval}
              />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#55726B" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-[#112723] text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-[#1E8A69]/40">
                      <div className="font-bold border-b border-white/10 pb-1 flex items-center justify-between gap-2">
                        <span>{p.fullDate}</span>
                        {p.surveysCount > 0 && (
                          <span className="text-[10px] text-emerald-400">
                            {p.surveysCount} зріз(ів)
                          </span>
                        )}
                      </div>
                      {p.hasData ? (
                        <div className="space-y-0.5 text-[11px]">
                          {p.craving !== null && <div>Тяга: <strong style={{ color: METRIC_COLORS.craving }}>{p.craving} / 10</strong></div>}
                          {p.energy !== null && <div>Енергія: <strong style={{ color: METRIC_COLORS.energy }}>{p.energy} / 10</strong></div>}
                          {p.calmness !== null && <div>Спокій: <strong style={{ color: METRIC_COLORS.calmness }}>{p.calmness} / 10</strong></div>}
                          {p.focus !== null && <div>Фокус: <strong style={{ color: METRIC_COLORS.focus }}>{p.focus} / 10</strong></div>}
                          {p.sleepHours !== null && <div>Сон: <strong style={{ color: METRIC_COLORS.sleep }}>{p.sleepHours} год</strong></div>}
                          {p.sexCount !== null && <div>Секс: <strong style={{ color: METRIC_COLORS.sex }}>{p.sexCount} раз</strong></div>}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">Немає записів за цей день</div>
                      )}
                    </div>
                  );
                }}
              />

              <Line
                type="monotone"
                dataKey="craving"
                name="Тяга"
                stroke={METRIC_COLORS.craving}
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: METRIC_COLORS.craving }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="energy"
                name="Енергія"
                stroke={METRIC_COLORS.energy}
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: METRIC_COLORS.energy }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="calmness"
                name="Спокій"
                stroke={METRIC_COLORS.calmness}
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: METRIC_COLORS.calmness }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="focus"
                name="Фокус"
                stroke={METRIC_COLORS.focus}
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: METRIC_COLORS.focus }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="sleepHours"
                name="Сон"
                stroke={METRIC_COLORS.sleep}
                strokeWidth={selectedRange > 30 ? 1.2 : 1.8}
                strokeDasharray="3 3"
                dot={selectedRange > 30 ? false : { r: 2, fill: METRIC_COLORS.sleep }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="sexCount"
                name="Секс"
                stroke={METRIC_COLORS.sex}
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 3, fill: METRIC_COLORS.sex }}
                connectNulls
              />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#B7CDC6" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="displayLabel"
                stroke="#55726B"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval={xAxisInterval}
              />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#55726B" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-[#112723] text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-[#1E8A69]/40">
                      <div className="font-bold border-b border-white/10 pb-1">
                        {p.fullDate}
                      </div>
                      {p.hasData ? (
                        <div className="space-y-0.5 text-[11px]">
                          {p.craving !== null && <div>Тяга: <strong style={{ color: METRIC_COLORS.craving }}>{p.craving} / 10</strong></div>}
                          {p.energy !== null && <div>Енергія: <strong style={{ color: METRIC_COLORS.energy }}>{p.energy} / 10</strong></div>}
                          {p.calmness !== null && <div>Спокій: <strong style={{ color: METRIC_COLORS.calmness }}>{p.calmness} / 10</strong></div>}
                          {p.focus !== null && <div>Фокус: <strong style={{ color: METRIC_COLORS.focus }}>{p.focus} / 10</strong></div>}
                          {p.sleepHours !== null && <div>Сон: <strong style={{ color: METRIC_COLORS.sleep }}>{p.sleepHours} год</strong></div>}
                          {p.sexCount !== null && <div>Секс: <strong style={{ color: METRIC_COLORS.sex }}>{p.sexCount} раз</strong></div>}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">Немає записів за цей день</div>
                      )}
                    </div>
                  );
                }}
              />

              <Bar dataKey="craving" name="Тяга" fill={METRIC_COLORS.craving} radius={[4, 4, 0, 0]} />
              <Bar dataKey="energy" name="Енергія" fill={METRIC_COLORS.energy} radius={[4, 4, 0, 0]} />
              <Bar dataKey="calmness" name="Спокій" fill={METRIC_COLORS.calmness} radius={[4, 4, 0, 0]} />
              <Bar dataKey="focus" name="Фокус" fill={METRIC_COLORS.focus} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sleepHours" name="Сон" fill={METRIC_COLORS.sleep} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sexCount" name="Секс" fill={METRIC_COLORS.sex} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                label={(entry: any) => `${entry.name}: ${entry.value}${entry.unit || ''}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#112723] text-white p-2 rounded-xl text-xs shadow-lg border border-[#1E8A69]/40 font-bold">
                      <span style={{ color: data.color }}>● {data.name}:</span> {data.value} {data.unit}
                    </div>
                  );
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Clean Typographic Legend matching all 6 unique non-repeating colors */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 mt-3 pt-2.5 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] text-[10px] font-medium text-[#55726B] dark:text-[#8FAAA3]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: METRIC_COLORS.craving }}></span>
          <span>Тяга (1–10)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: METRIC_COLORS.energy }}></span>
          <span>Енергія (1–10)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: METRIC_COLORS.calmness }}></span>
          <span>Спокій (1–10)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: METRIC_COLORS.focus }}></span>
          <span>Фокус (1–10)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: METRIC_COLORS.sleep }}></span>
          <span>Сон (год)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: METRIC_COLORS.sex }}></span>
          <span>Секс (раз)</span>
        </div>
      </div>
    </div>
  );
};
