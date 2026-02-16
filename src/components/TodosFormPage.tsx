import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import axios from "axios";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
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
import "dayjs/locale/tr";

dayjs.locale("tr");

export type NewTodo = {
	title: string;
	description: string | null;
	parent_goal_id: number | null;
	completed: boolean;
	completed_date: Dayjs | null; // send as ISO string
	deadline_date: Dayjs; // send as ISO string
};

function toNumberOrNull(v: string) {
	const s = v.trim();
	if (!s) return null;
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

export function TodosFormPage() {
	const now = dayjs();

	const defaultTodo: NewTodo = {
		title: "",
		description: null,
		parent_goal_id: null,
		completed: false,
		completed_date: null,
		deadline_date: now.add(7, "day"), // default: 1 hafta sonrası
	};

	const [todo, setTodo] = useState<NewTodo>(defaultTodo);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const canSave = useMemo(() => {
		if (todo.title.trim().length === 0) return false;
		if (!todo.deadline_date) return false;
		return true;
	}, [todo.title, todo.deadline_date]);

	const saveTodo = async () => {
		setSaving(true);
		try {
			// Backend genelde ISO string bekler:
			const payload = {
				title: todo.title,
				description: todo.description,
				parent_goal_id: todo.parent_goal_id,
				completed: todo.completed,
				completed_date: todo.completed_date
					? todo.completed_date.toISOString()
					: null,
				deadline_date: todo.deadline_date.toISOString(),
			};

			await axios.post("http://localhost:5000/todos", payload);
			setTodo(defaultTodo);
		} finally {
			setSaving(false);
		}
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<div className="min-h-[calc(100vh-2rem)] w-full flex items-center justify-center p-6">
				<Card className="w-full max-w-3xl shadow-sm">
					<CardHeader className="space-y-1">
						<CardTitle>Todos</CardTitle>
						<CardDescription>
							Bir todo oluştur: başlık, açıklama, deadline vb.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<form
							className="space-y-6"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<AppDialog
								open={saveDialogOpen}
								title="Todo kaydet?"
								message="Emin misiniz?"
								showCancel
								confirmText={saving ? "Kaydediliyor..." : "Kaydet"}
								cancelText="İptal"
								onClose={() => setSaveDialogOpen(false)}
								onConfirm={async () => {
									if (!canSave || saving) return;
									await saveTodo();
									setSaveDialogOpen(false);
								}}
							/>

							{/* Title */}
							<div className="space-y-2">
								<div className="text-sm font-medium">Başlık</div>
								<TextField
									fullWidth
									value={todo.title}
									label="Örn: Learn Kafka"
									onChange={(e) =>
										setTodo((p) => ({ ...p, title: e.target.value }))
									}
								/>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<div className="text-sm font-medium">Açıklama</div>
								<TextField
									fullWidth
									multiline
									minRows={3}
									value={todo.description ?? ""}
									label="İsteğe bağlı"
									onChange={(e) =>
										setTodo((p) => ({
											...p,
											description: e.target.value.trim().length
												? e.target.value
												: null,
										}))
									}
								/>
							</div>

							<Separator />

							{/* Parent Goal Id */}
							<div className="grid grid-cols-12 gap-3 items-end">
								<div className="col-span-12 md:col-span-6 space-y-2">
									<div className="text-sm font-medium">Parent Goal Id</div>
									<Input
										type="number"
										value={
											todo.parent_goal_id === null
												? ""
												: String(todo.parent_goal_id)
										}
										onChange={(e) =>
											setTodo((p) => ({
												...p,
												parent_goal_id: toNumberOrNull(e.target.value),
											}))
										}
										placeholder="(opsiyonel)"
									/>
								</div>

								<div className="col-span-12 md:col-span-6">
									<div className="text-xs text-muted-foreground">
										Not: Parent Goal Id boşsa “root todo” gibi düşünebilirsin.
									</div>
								</div>
							</div>

							<Separator />

							{/* Completed + Completed Date */}
							<div className="grid grid-cols-12 gap-3 items-end">
								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Completed</div>
									<TextField
										select
										SelectProps={{ native: true }}
										value={todo.completed ? "true" : "false"}
										onChange={(e) => {
											const completed = e.target.value === "true";
											setTodo((p) => ({
												...p,
												completed,
												completed_date: completed
													? (p.completed_date ?? now)
													: null,
											}));
										}}
										label="Durum"
									>
										<option value="false">Hayır</option>
										<option value="true">Evet</option>
									</TextField>
								</div>

								<div className="col-span-12 md:col-span-8 space-y-2">
									<div className="text-sm font-medium">Completed Date</div>
									<DateTimePicker
										disabled={!todo.completed}
										value={todo.completed_date}
										format="DD/MM/YYYY HH:mm"
										onChange={(e) =>
											setTodo((p) => ({ ...p, completed_date: e }))
										}
										viewRenderers={{
											hours: renderTimeViewClock,
											minutes: renderTimeViewClock,
											seconds: renderTimeViewClock,
										}}
									/>
								</div>
							</div>

							<Separator />

							{/* Deadline */}
							<div className="space-y-2">
								<div className="text-sm font-medium">Deadline</div>
								<DateTimePicker
									value={todo.deadline_date}
									format="DD/MM/YYYY HH:mm"
									onChange={(e) => {
										// deadline zorunlu; null olmasın diye fallback
										setTodo((p) => ({
											...p,
											deadline_date: e ?? p.deadline_date ?? now,
										}));
									}}
									viewRenderers={{
										hours: renderTimeViewClock,
										minutes: renderTimeViewClock,
										seconds: renderTimeViewClock,
									}}
								/>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-end gap-3">
								<Button
									variant="outline"
									type="button"
									onClick={() => setTodo(defaultTodo)}
								>
									Reset
								</Button>

								<Button
									variant="outline"
									type="button"
									disabled={!canSave || saving}
									onClick={() => setSaveDialogOpen(true)}
								>
									Kaydet
								</Button>
							</div>

							{!canSave && (
								<div className="text-xs text-muted-foreground">
									Kaydetmek için başlık ve deadline zorunlu.
								</div>
							)}
						</form>
					</CardContent>
				</Card>
			</div>
		</LocalizationProvider>
	);
}
