import { BarChart } from "@mui/x-charts/BarChart";
import axios from "axios";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RoutineSummaryPart } from "@/models/Routine";

type ApiResponse = Record<string, RoutineSummaryPart[]>; // backend JSON key = ISO string

function labelMonth(m: Dayjs) {
	return m.format("MMM YYYY");
}

function randomHsl() {
	const h = Math.floor(Math.random() * 360);
	const s = 65 + Math.floor(Math.random() * 25); // 65–89
	const l = 40 + Math.floor(Math.random() * 20); // 40–59
	return `hsl(${h} ${s}% ${l}%)`;
}

function minutesToHoursMinutes(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) {
		return `${minutes} dk`;
	}
	return `${hours} saat ${minutes} dk`;
}

function toDataset(parts: RoutineSummaryPart[], topN: number) {
	// description -> minutes toplamı
	const totals = new Map<string, number>();
	for (const p of parts as any[]) {
		const desc = String((p as any).description ?? "Unknown");
		const minutes = Number((p as any).total_minutes ?? 0);
		totals.set(desc, (totals.get(desc) ?? 0) + minutes);
	}

	const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);

	const top = sorted.slice(0, topN);
	const rest = sorted.slice(topN);

	const dataset = top.map(([label, minutes]) => ({
		label,
		minutes,
		color: randomHsl(), // ✅ her render’da yeniden random
	}));

	// ✅ SEN "Diğer"i açtım demiştin: rest varsa ekliyoruz
	if (rest.length) {
		const other = rest.reduce((acc, [, v]) => acc + v, 0);
		dataset.push({ label: "Diğer", minutes: other, color: randomHsl() });
	}

	return {
		dataset,
		totalCategories: sorted.length,
		hiddenCategories: rest.length,
	};
}

export default function MonthlySummaryComponent() {
	const [grouped, setGrouped] = useState<Map<Dayjs, RoutineSummaryPart[]>>(
		() => new Map(),
	);
	const [loading, setLoading] = useState(false);

	// Ay bazlı "hepsini göster" state'i: her ay için ayrı ayrı toggle
	const [showAllByMonth, setShowAllByMonth] = useState<Record<string, boolean>>(
		{},
	);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			setLoading(true);
			try {
				const res = await axios.get<ApiResponse>(
					"http://localhost:5000/routine/parts/group",
				);

				// Record<string, ...> -> Map<Dayjs, ...>
				const m = new Map<Dayjs, RoutineSummaryPart[]>();
				for (const [k, v] of Object.entries(res.data)) {
					const month = dayjs(k).startOf("month");
					m.set(month, v);
				}

				if (!cancelled) setGrouped(m);
			} catch (e) {
				console.error(e);
				if (!cancelled) setGrouped(new Map());
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const last3 = useMemo(() => {
		const entries = Array.from(grouped.entries())
			.filter(([m]) => m.isValid())
			.sort((a, b) => a[0].valueOf() - b[0].valueOf());
		return entries.slice(-3);
	}, [grouped]);

	return (
		<div
			className="flex items-center justify-center p-6"
			style={{ width: 1400 }}
		>
			<div className="w-full">
				<div className="flex items-center justify-between">
					<div className="text-lg font-semibold">Son 3 Ay</div>
					<div className="text-sm text-muted-foreground">
						{loading ? "Yükleniyor..." : `${grouped.size} ay`}
					</div>
				</div>

				<Separator className="my-4" />

				{last3.length === 0 ? (
					<Card>
						<CardContent className="p-6 text-sm text-muted-foreground">
							Gösterilecek veri yok.
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{last3.map(([month, parts]) => {
							const monthId = month.format("YYYY-MM");
							const showAll = showAllByMonth[monthId] ?? false;

							const TOP_N_DEFAULT = 10;
							const effectiveTopN = showAll ? 10_000_000 : TOP_N_DEFAULT;

							const { dataset, totalCategories, hiddenCategories } = toDataset(
								parts,
								effectiveTopN,
							);

							// Scroll + dinamik height (showAll açıkken)
							const ROW_PX = 28;
							const chartHeight = Math.max(260, dataset.length * ROW_PX);
							const containerClass = showAll
								? "h-[520px] overflow-y-auto pr-2"
								: "pr-2";

							return (
								<Card key={month.valueOf()} className="w-full">
									<CardHeader className="pb-2">
										<CardTitle className="text-base">
											{labelMonth(month)}
										</CardTitle>
										<div className="text-xs text-muted-foreground">
											{showAll
												? `${totalCategories} kategori`
												: `${Math.min(TOP_N_DEFAULT, totalCategories)} / ${totalCategories} kategori`}
										</div>
									</CardHeader>

									<CardContent className="pt-2">
										{dataset.length === 0 ? (
											<div className="text-sm text-muted-foreground">
												Bu ay veri yok.
											</div>
										) : (
											<>
												<div className={containerClass}>
													<BarChart
														height={showAll ? chartHeight : 260}
														dataset={dataset}
														layout="horizontal"
														yAxis={[{ scaleType: "band", dataKey: "label" }]}
														xAxis={[{ label: "Süre" }]}
														series={[
															{
																dataKey: "minutes",
																label: "Süre",
																valueFormatter: (v: number) =>
																	minutesToHoursMinutes(v),
															},
														]}
														margin={{
															left: 20,
															right: 20,
															top: 10,
															bottom: 30,
														}}
													/>
												</div>

												{/* Alt buton */}
												{totalCategories > TOP_N_DEFAULT && (
													<div className="mt-3 flex justify-end">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																setShowAllByMonth((prev) => ({
																	...prev,
																	[monthId]: !showAll,
																}))
															}
														>
															{showAll
																? "Daha az göster"
																: `Hepsini göster (+${hiddenCategories})`}
														</Button>
													</div>
												)}
											</>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
