"use client";

import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area
} from "recharts";

const COLORS = ["#8B5CF6", "#F59E0B", "#10B981", "#EF4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-slate-500 dark:text-slate-400 capitalize">
                            {entry.name}:
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function AttendancePieChart({ data }: { data: { name: string; value: number }[] }) {
    return (
        <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function OccupancyBarChart({ data }: { data: { name: string; occupied: number; capacity: number }[] }) {
    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={0}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#6D28D9" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Bar
                        dataKey="occupied"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                        name="Occupied"
                        barSize={20}
                    />
                    <Bar
                        dataKey="capacity"
                        fill="#E2E8F0"
                        radius={[6, 6, 0, 0]}
                        name="Capacity"
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ActivityAreaChart({ data }: { data: { name: string; value: number }[] }) {
    return (
        <div className="h-full w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
