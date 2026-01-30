import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import type { RoutineOnlyResponse } from "@/models/Routine";

export const Route = createFileRoute("/")({
	component: App,
});

export default function App() {
	const navigate = useNavigate();
	const [routines, setRoutines] = useState<RoutineOnlyResponse[]>([]);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [willBeDeletedRoutineId, setWillBeDeletedRoutineId] = useState<
		number | null
	>(null);

	async function deleteRoutine(id: number) {
		console.log("Deleting routine with id:", id);
		try {
			const res = await axios.delete("http://localhost:5000/routine/" + id);

			console.log("Delete response:", res.data);

			await fetchRoutines();

			setWillBeDeletedRoutineId(null);
		} catch (err) {
			console.error("Error deleting routine:", err);
		}
	}
	const fetchRoutines = useCallback(async () => {
		try {
			const res = await axios.get<RoutineOnlyResponse[]>(
				"http://localhost:5000/routine/only",
			);
			setRoutines(res.data);
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		fetchRoutines();
	}, [fetchRoutines]);

	const [q, setQ] = useState("");

	const filtered = useMemo(() => {
		const s = q.trim().toLowerCase();
		if (!s) return routines;
		return routines.filter((r) => r.title.toLowerCase().includes(s));
	}, [q, routines]);

	return (
		<div className="min-h-[calc(100vh-2rem)] w-full flex items-center justify-center p-6">
			<AppDialog
				open={deleteDialogOpen}
				title="Rutini sil?"
				message="Bu aksiyon geri alınamaz. Emin misiniz?"
				showCancel
				confirmText="Sil"
				cancelText="İptal"
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={() => {
					if (willBeDeletedRoutineId === null) return;
					console.log(
						"Confirmed delete for routine id:",
						willBeDeletedRoutineId,
					);
					// do delete
					deleteRoutine(willBeDeletedRoutineId);
					setDeleteDialogOpen(false);
				}}
			/>
			<Card className="w-full max-w-3xl shadow-sm">
				<CardHeader className="space-y-1">
					<CardTitle>Daily Routines</CardTitle>
					<CardDescription>
						Rutin gruplarını görüntüle, ara, ekle/sil.
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
								placeholder="Örn: Morning, Workout..."
							/>
						</div>

						<div className="flex gap-2 sm:justify-end">
							<Button
								variant="outline"
								type="button"
								onClick={async () => {
									await fetchRoutines();
								}}
							>
								Reset
							</Button>
							<Button
								type="button"
								onClick={() => {
									navigate({ to: "/daily-routines" });
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
							<div className="text-sm font-medium">Rutinler</div>
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
								{/* Header */}
								<div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/30">
									<div className="col-span-6">Başlık</div>
									<div className="col-span-2">Oluşturulma Tarihi</div>
									<div className="col-span-2">Güncellenme Tarihi</div>
									<div className="col-span-2 text-right">İşlem</div>
								</div>
								<Separator />

								{/* Rows */}
								<div className="divide-y">
									{filtered.slice(0, 10).map((r) => (
										<div
											key={r.id}
											className="grid grid-cols-12 gap-2 px-3 py-3 items-center"
										>
											<div className="col-span-6">
												<div className="text-sm font-medium">{r.title}</div>
												<div className="text-xs text-muted-foreground">
													id: {r.id}
												</div>
											</div>

											<div className="col-span-2 text-sm tabular-nums">
												{r.create_date
													? dayjs(r.create_date).format("DD/MM/YYYY HH:mm")
													: "-"}
											</div>

											<div className="col-span-2 text-sm tabular-nums">
												{r.update_date
													? dayjs(r.update_date).format("DD/MM/YYYY HH:mm")
													: "-"}
											</div>

											<div className="col-span-2 flex justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													type="button"
													onClick={() => {
														navigate({
															to: `/daily-routines/${r.id}/edit`,
														});
													}}
												>
													Aç
												</Button>
												<Button
													variant="destructive"
													size="sm"
													type="button"
													onClick={() => {
														setWillBeDeletedRoutineId(r.id);
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
						)}
					</div>

					{/* Alt sağ aksiyon (resimdeki Kaydet hissi) */}
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
