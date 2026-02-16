import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import dayjs, { type Dayjs } from "dayjs";
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

export type TodoSelectDto = {
	id: string;
	title: string;
	description: string | null;
	parent_goal_id: number | null;
	completed: boolean;
	completed_date: Dayjs | null;
	deadline_date: string; // ISO string (backend)
	create_date: Dayjs;
	update_date: Dayjs;
	delete_date: Dayjs | null;
};

function fmtDate(v: any) {
	if (!v) return "-";
	return dayjs(v).format("DD/MM/YYYY HH:mm");
}

function formatBool(v: boolean) {
	return v ? "Evet" : "Hayır";
}

export function TodosListComponent() {
	const navigate = useNavigate();

	const [todos, setTodos] = useState<TodoSelectDto[]>([]);
	const [q, setQ] = useState("");

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [willBeDeletedTodoId, setWillBeDeletedTodoId] = useState<string | null>(
		null,
	);

	const fetchTodos = useCallback(async () => {
		try {
			// endpoint sende farklıysa değiştir
			const res = await axios.get<any[]>("http://localhost:5000/todos");

			// Backend ISO string döndürüyor varsayımıyla: dayjs alanlarını burada parse ediyoruz
			const mapped: TodoSelectDto[] = (res.data ?? []).map((t) => ({
				id: String(t.id),
				title: String(t.title ?? ""),
				description: t.description ?? null,
				parent_goal_id: t.parent_goal_id ?? null,
				completed: Boolean(t.completed),
				completed_date: t.completed_date ? dayjs(t.completed_date) : null,
				deadline_date: String(t.deadline_date ?? ""), // istersen bunu da Dayjs yapabilirsin
				create_date: t.create_date ? dayjs(t.create_date) : dayjs(0),
				update_date: t.update_date ? dayjs(t.update_date) : dayjs(0),
				delete_date: t.delete_date ? dayjs(t.delete_date) : null,
			}));

			setTodos(mapped);
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		fetchTodos();
	}, [fetchTodos]);

	async function deleteTodo(id: string) {
		try {
			await axios.delete(
				"http://localhost:5000/todos?id=" + encodeURIComponent(id),
			);
			await fetchTodos();
			setWillBeDeletedTodoId(null);
		} catch (err) {
			console.error("Error deleting todo:", err);
		}
	}

	const filtered = useMemo(() => {
		const s = q.trim().toLowerCase();
		if (!s) return todos;

		return todos.filter((t) => {
			const fields = [
				t.id,
				t.title,
				t.description ?? "",
				String(t.parent_goal_id ?? ""),
				t.completed ? "true" : "false",
				t.completed_date ? t.completed_date.toISOString() : "",
				t.deadline_date ?? "",
				t.create_date ? t.create_date.toISOString() : "",
				t.update_date ? t.update_date.toISOString() : "",
				t.delete_date ? t.delete_date.toISOString() : "",
			]
				.join(" ")
				.toLowerCase();

			return fields.includes(s);
		});
	}, [q, todos]);

	const cols =
		"grid-cols-[minmax(210px,1.2fr)_minmax(220px,1.2fr)_minmax(320px,2fr)_minmax(140px,0.9fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(140px,0.9fr)_minmax(140px,0.9fr)_minmax(110px,0.8fr)]";

	return (
		<div
			className="flex items-center justify-center p-6"
			style={{ width: 1400 }}
		>
			<AppDialog
				open={deleteDialogOpen}
				title="Todo sil?"
				message="Bu aksiyon geri alınamaz. Emin misiniz?"
				showCancel
				confirmText="Sil"
				cancelText="İptal"
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={() => {
					if (willBeDeletedTodoId === null) return;
					deleteTodo(willBeDeletedTodoId);
					setDeleteDialogOpen(false);
				}}
			/>

			<Card className="shadow-sm" style={{ width: 1400 }}>
				<CardHeader className="space-y-1">
					<CardTitle>Todos</CardTitle>
					<CardDescription>Todoları görüntüle, ara, ekle/sil.</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Üst aksiyon satırı */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="space-y-2 w-full sm:max-w-sm">
							<div className="text-sm font-medium">Ara</div>
							<Input
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Id, title, description..."
							/>
						</div>

						<div className="flex gap-2 sm:justify-end">
							<Button
								variant="outline"
								type="button"
								onClick={async () => {
									setQ("");
									await fetchTodos();
								}}
							>
								Reset
							</Button>

							<Button
								type="button"
								onClick={() => {
									navigate({ to: "/todos/new" }); // route sende neyse
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
							<div className="text-sm font-medium">Todo listesi</div>
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
										className={`min-w-[1600px] grid ${cols} gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/30`}
									>
										<div>Id</div>
										<div>Title</div>
										<div>Description</div>
										<div>Parent Goal</div>
										<div>Completed</div>
										<div>Completed Date</div>
										<div>Deadline</div>
										<div>Created</div>
										<div>Updated</div>
										<div>Deleted</div>
										<div className="text-right">İşlem</div>
									</div>

									<Separator />

									{/* Rows */}
									<div className="divide-y min-w-[1600px]">
										{filtered.slice(0, 10).map((t) => (
											<div
												key={t.id}
												className={`grid ${cols} gap-2 px-4 py-3 items-center`}
											>
												<div className="text-sm font-medium">{t.id}</div>

												<div className="text-sm font-medium">{t.title}</div>

												<div className="text-sm text-muted-foreground line-clamp-2">
													{t.description ?? "-"}
												</div>

												<div className="text-sm">{t.parent_goal_id ?? "-"}</div>

												<div className="text-sm">{formatBool(t.completed)}</div>

												<div className="text-sm tabular-nums">
													{t.completed_date
														? t.completed_date.format("DD/MM/YYYY HH:mm")
														: "-"}
												</div>

												<div className="text-sm tabular-nums">
													{fmtDate(t.deadline_date)}
												</div>

												<div className="text-sm tabular-nums">
													{t.create_date
														? t.create_date.format("DD/MM/YYYY HH:mm")
														: "-"}
												</div>

												<div className="text-sm tabular-nums">
													{t.update_date
														? t.update_date.format("DD/MM/YYYY HH:mm")
														: "-"}
												</div>

												<div className="text-sm tabular-nums">
													{t.delete_date
														? t.delete_date.format("DD/MM/YYYY HH:mm")
														: "-"}
												</div>

												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														type="button"
														onClick={() =>
															navigate({ to: `/todos/${t.id}/edit` })
														}
													>
														Aç
													</Button>

													<Button
														variant="destructive"
														size="sm"
														type="button"
														onClick={() => {
															setWillBeDeletedTodoId(t.id);
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
