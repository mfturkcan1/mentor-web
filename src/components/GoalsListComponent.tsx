import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoalLifeCycleLabels, type GoalResponse } from "@/models/Goal"; // path sende farklıysa düzelt

function formatEnum(v: unknown) {
	if (v === null || v === undefined) return "-";
	return v as string;
}

function fmtDate(v: any) {
	if (!v) return "-";
	return dayjs(v).format("DD/MM/YYYY HH:mm");
}

function fmtNum(v: any) {
	if (v === null || v === undefined) return "-";
	const n = Number(v);
	if (Number.isNaN(n)) return String(v);
	return new Intl.NumberFormat("tr-TR").format(n);
}

export function GoalsListComponent() {
	const navigate = useNavigate();

	const [goals, setGoals] = useState<GoalResponse[]>([]);
	const [q, setQ] = useState("");

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [willBeDeletedGoalId, setWillBeDeletedGoalId] = useState<number | null>(
		null,
	);

	const findParentGoalTitle = (parentGoalId: number | null) => {
		if (parentGoalId === null) return "-";
		const parentGoal = goals.find((g) => g.id === parentGoalId);
		return parentGoal ? parentGoal.title : "-";
	};

	const fetchGoals = useCallback(async () => {
		try {
			const res = await axios.get<GoalResponse[]>(
				"http://localhost:5000/goals",
			);
			setGoals(res.data);
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		fetchGoals();
	}, [fetchGoals]);

	async function deleteGoal(id: number) {
		try {
			await axios.delete("http://localhost:5000/goals?id=" + id);
			await fetchGoals();
			setWillBeDeletedGoalId(null);
		} catch (err) {
			console.error("Error deleting goal:", err);
		}
	}

	const filtered = useMemo(() => {
		const s = q.trim().toLowerCase();
		if (!s) return goals;
		return goals.filter((g) => {
			const fields = [
				g.title,
				g.description ?? "",
				String(g.period_type ?? ""),
				String(g.status ?? ""),
				String(g.priority ?? ""),
				g.unit ?? "",
				String(g.parent_goal_id ?? ""),
				String(g.target_value ?? ""),
				String(g.current_value ?? ""),
			]
				.join(" ")
				.toLowerCase();
			return fields.includes(s);
		});
	}, [q, goals]);

	// Header + row aynı template'i kullansın diye:
	const cols =
		"grid-cols-[minmax(120px,1.4fr)_minmax(220px,1.4fr)_minmax(300px,2fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(160px,1fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_minmax(90px,0.7fr)_minmax(120px,0.9fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(140px,0.9fr)]";

	return (
		<div
			className="flex items-center justify-center p-6"
			style={{ width: 1400 }}
		>
			<AppDialog
				open={deleteDialogOpen}
				title="Hedefi sil?"
				message="Bu aksiyon geri alınamaz. Emin misiniz?"
				showCancel
				confirmText="Sil"
				cancelText="İptal"
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={() => {
					if (willBeDeletedGoalId === null) return;
					deleteGoal(willBeDeletedGoalId);
					setDeleteDialogOpen(false);
				}}
			/>

			<Card className="shadow-sm" style={{ width: 1400 }}>
				<CardHeader className="space-y-1">
					<CardTitle>Goals</CardTitle>
					<CardDescription>
						Hedefleri görüntüle, ara, ekle/sil. (id & delete_date hariç tüm
						alanlar kolonlarda)
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Üst aksiyon satırı */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-2 w-full sm:max-w-sm">
							<div className="text-sm font-medium">Ara</div>
							<Input
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Title, status, priority, unit..."
							/>
						</div>

						<div className="flex gap-2 sm:justify-end">
							<Button
								variant="outline"
								type="button"
								onClick={async () => {
									setQ("");
									await fetchGoals();
								}}
							>
								Reset
							</Button>
							<Button
								type="button"
								onClick={() => {
									navigate({ to: "/goals/new" }); // route sende neyse
								}}
							>
								Yeni ekle
							</Button>
						</div>
					</div>

					<Separator />

					{/* Tablo-like liste */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="text-sm font-medium">Hedefler</div>
							<div className="text-xs text-muted-foreground">
								{filtered.length} kayıt
							</div>
						</div>

						{filtered.length === 0 ? (
							<div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
								Sonuç yok.
							</div>
						) : (
							<div className="rounded-md border overflow-hidden">
								<div className="overflow-x-auto">
									{/* Header */}
									<div
										className={`min-w-[1700px] grid ${cols} gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/30`}
									>
										<div>Id</div>
										<div>Title</div>
										<div>Description</div>
										<div>Goal Cycle</div>
										<div>Period</div>
										<div>Period Start</div>
										<div>Period End</div>
										<div>Deadline</div>
										<div>Status</div>
										<div>Priority</div>
										<div className="text-right">Current</div>
										<div className="text-right">Target</div>
										<div>Unit</div>
										<div>Parent Goal</div>
										<div>Created</div>
										<div>Updated</div>
										<div className="text-right">İşlem</div>
									</div>

									<Separator />

									{/* Rows */}
									<div className="divide-y min-w-[1700px]">
										{filtered.slice(0, 10).map((g) => (
											<div
												key={g.id}
												className={`grid ${cols} gap-2 px-4 py-3 items-center`}
											>
												<div className="text-sm font-medium">{g.id}</div>
												<div className="text-sm font-medium">{g.title}</div>

												<div className="text-sm text-muted-foreground line-clamp-2">
													{g.description ?? "-"}
												</div>

												<div className="text-sm">
													{GoalLifeCycleLabels[g.goal_cycle]}
												</div>

												<div className="text-sm">
													{formatEnum(g.period_type)}
												</div>

												<div className="text-sm tabular-nums">
													{fmtDate(g.period_start)}
												</div>

												<div className="text-sm tabular-nums">
													{fmtDate(g.period_end)}
												</div>

												<div className="text-sm tabular-nums">
													{fmtDate(g.deadline_at)}
												</div>

												<div className="text-sm">{formatEnum(g.status)}</div>

												<div className="text-sm">{formatEnum(g.priority)}</div>

												<div className="text-sm tabular-nums text-right">
													{fmtNum(g.current_value)}
												</div>

												<div className="text-sm tabular-nums text-right">
													{fmtNum(g.target_value)}
												</div>

												<div className="text-sm">{g.unit ?? "-"}</div>

												<div className="text-sm">
													{findParentGoalTitle(g.parent_goal_id)}
												</div>

												<div className="text-sm tabular-nums">
													{fmtDate(g.create_date)}
												</div>

												<div className="text-sm tabular-nums">
													{fmtDate(g.update_date)}
												</div>

												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														type="button"
														onClick={() =>
															navigate({ to: `/goals/${g.id}/edit` })
														}
													>
														Aç
													</Button>
													<Button
														variant="destructive"
														size="sm"
														type="button"
														onClick={() => {
															setWillBeDeletedGoalId(g.id);
															setDeleteDialogOpen(true);
														}}
													>
														Sil
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Alt sağ aksiyon */}
					<div className="flex items-center justify-end gap-3">
						<Button
							variant="outline"
							type="button"
							onClick={() => console.log("save")}
						>
							Kaydet
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
