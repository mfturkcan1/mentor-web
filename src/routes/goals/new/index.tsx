import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/goals/new/")({
	component: GoalsFormPage,
});

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import axios from "axios";
import dayjs from "dayjs";
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
import {
	GoalPeriodType,
	GoalPriority,
	type GoalRequestDto,
	GoalStatus,
} from "@/models/Goal";

dayjs.locale("tr");

// --- HELPERS ---
function enumOptions<T extends Record<string, string>>(e: T) {
	return Object.values(e);
}

function toNumberOrNull(v: string) {
	const s = v.trim();
	if (!s) return null;
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

function toNumberOrZero(v: string) {
	const s = v.trim();
	if (!s) return 0;
	const n = Number(s);
	return Number.isFinite(n) ? n : 0;
}

// --- COMPONENT ---
export function GoalsFormPage() {
	const now = dayjs();

	const defaultGoal: GoalRequestDto = {
		title: "",
		description: null,
		period_type: GoalPeriodType.MONTH,
		deadline_at: null,
		period_start: now.toDate(),
		period_end: now.add(1, "month").toDate(),
		status: GoalStatus.PLANNED,
		priority: GoalPriority.MEDIUM,
		target_value: null,
		current_value: 0,
		unit: null,
		parent_goal_id: null,
	};

	const [goal, setGoal] = useState<GoalRequestDto>(defaultGoal);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	// isteğe bağlı: title autocomplete datası (sonradan backend’e bağlarsın)
	const titleSuggestions = useMemo(
		() => ["Powerlifting Total", "Cut / Bulk", "Side Project", "Study Plan"],
		[],
	);

	const periodTypeOptions = useMemo(() => enumOptions(GoalPeriodType), []);
	const statusOptions = useMemo(() => enumOptions(GoalStatus), []);
	const priorityOptions = useMemo(() => enumOptions(GoalPriority), []);

	const requiresDates = goal.period_type !== GoalPeriodType.DEADLINE;
	const requiresDeadline = goal.period_type === GoalPeriodType.DEADLINE;

	const canSave = useMemo(() => {
		if (goal.title.trim().length === 0) return false;

		if (requiresDeadline) {
			return goal.deadline_at !== null;
		}

		// Month/Year: start & end zorunlu
		return goal.period_start !== null && goal.period_end !== null;
	}, [
		goal.title,
		goal.deadline_at,
		goal.period_start,
		goal.period_end,
		requiresDeadline,
	]);

	const saveGoal = async () => {
		// şimdilik sadece create
		setSaving(true);
		try {
			// backend Date bekliyorsa toISOString() yollamak daha stabil olabilir.
			// burada direkt DTO gönderiyorum; backend nasıl parse ediyor ona göre düzenlersin.
			await axios.post("http://localhost:5000/goals", [goal]);
		} finally {
			setSaving(false);
		}
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<div className="min-h-[calc(100vh-2rem)] w-full flex items-center justify-center p-6">
				<Card className="w-full max-w-3xl shadow-sm">
					<CardHeader className="space-y-1">
						<CardTitle>Goals</CardTitle>
						<CardDescription>
							Bir hedef oluştur: periyot, durum, öncelik ve metrikleri ayarla.
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
								title="Hedefi kaydet?"
								message="Emin misiniz?"
								showCancel
								confirmText={saving ? "Kaydediliyor..." : "Kaydet"}
								cancelText="İptal"
								onClose={() => setSaveDialogOpen(false)}
								onConfirm={async () => {
									if (!canSave || saving) return;
									await saveGoal();
									setSaveDialogOpen(false);
								}}
							/>

							{/* Title */}
							<div className="space-y-2">
								<div className="text-sm font-medium">Başlık</div>
								<Autocomplete
									freeSolo
									value={goal.title}
									options={titleSuggestions}
									renderInput={(params) => (
										<TextField {...params} label="Örn: 2026 Strength Plan" />
									)}
									onInputChange={(_, newValue) => {
										setGoal((prev) => ({ ...prev, title: newValue }));
									}}
								/>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<div className="text-sm font-medium">Açıklama</div>
								<TextField
									fullWidth
									multiline
									minRows={3}
									value={goal.description ?? ""}
									label="İsteğe bağlı"
									onChange={(e) =>
										setGoal((prev) => ({
											...prev,
											description: e.target.value.trim().length
												? e.target.value
												: null,
										}))
									}
								/>
							</div>

							<Separator />

							{/* Period / Status / Priority */}
							<div className="grid grid-cols-12 gap-3 items-end">
								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Periyot Tipi</div>
									<Autocomplete
										disableClearable
										value={goal.period_type}
										options={periodTypeOptions}
										renderInput={(params) => (
											<TextField {...params} label="Period Type" />
										)}
										onChange={(_, newValue) => {
											const pt = newValue as GoalPeriodType;
											setGoal((prev) => {
												// Deadline seçilince start/end temizle, Month/Year seçilince deadline temizle
												if (pt === GoalPeriodType.DEADLINE) {
													return {
														...prev,
														period_type: pt,
														period_start: null,
														period_end: null,
													};
												}
												return {
													...prev,
													period_type: pt,
													deadline_at: null,
													period_start: prev.period_start ?? now.toDate(),
													period_end:
														prev.period_end ?? now.add(1, "month").toDate(),
												};
											});
										}}
									/>
								</div>

								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Durum</div>
									<Autocomplete
										disableClearable
										value={goal.status}
										options={statusOptions}
										renderInput={(params) => (
											<TextField {...params} label="Status" />
										)}
										onChange={(_, newValue) => {
											setGoal((prev) => ({
												...prev,
												status: newValue as GoalStatus,
											}));
										}}
									/>
								</div>

								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Öncelik</div>
									<Autocomplete
										disableClearable
										value={goal.priority}
										options={priorityOptions}
										renderInput={(params) => (
											<TextField {...params} label="Priority" />
										)}
										onChange={(_, newValue) => {
											setGoal((prev) => ({
												...prev,
												priority: newValue as GoalPriority,
											}));
										}}
									/>
								</div>
							</div>

							{/* Dates */}
							<div className="grid grid-cols-12 gap-3 items-end">
								{requiresDates && (
									<>
										<div className="col-span-12 md:col-span-6 space-y-2">
											<div className="text-sm font-medium">
												Periyot Başlangıç
											</div>
											<DateTimePicker
												value={
													goal.period_start ? dayjs(goal.period_start) : null
												}
												format="DD/MM/YYYY HH:mm"
												onChange={(e) => {
													setGoal((prev) => ({
														...prev,
														period_start: e ? e.toDate() : null,
													}));
												}}
												viewRenderers={{
													hours: renderTimeViewClock,
													minutes: renderTimeViewClock,
													seconds: renderTimeViewClock,
												}}
											/>
										</div>

										<div className="col-span-12 md:col-span-6 space-y-2">
											<div className="text-sm font-medium">Periyot Bitiş</div>
											<DateTimePicker
												value={goal.period_end ? dayjs(goal.period_end) : null}
												format="DD/MM/YYYY HH:mm"
												onChange={(e) => {
													setGoal((prev) => ({
														...prev,
														period_end: e ? e.toDate() : null,
													}));
												}}
												viewRenderers={{
													hours: renderTimeViewClock,
													minutes: renderTimeViewClock,
													seconds: renderTimeViewClock,
												}}
											/>
										</div>
									</>
								)}

								{requiresDeadline && (
									<div className="col-span-12 space-y-2">
										<div className="text-sm font-medium">Deadline</div>
										<DateTimePicker
											value={goal.deadline_at ? dayjs(goal.deadline_at) : null}
											format="DD/MM/YYYY HH:mm"
											onChange={(e) => {
												setGoal((prev) => ({
													...prev,
													deadline_at: e ? e.toDate() : null,
												}));
											}}
											viewRenderers={{
												hours: renderTimeViewClock,
												minutes: renderTimeViewClock,
												seconds: renderTimeViewClock,
											}}
										/>
									</div>
								)}
							</div>

							<Separator />

							{/* Metrics */}
							<div className="grid grid-cols-12 gap-3 items-end">
								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Current Value</div>
									<Input
										type="number"
										value={String(goal.current_value ?? 0)}
										onChange={(e) =>
											setGoal((prev) => ({
												...prev,
												current_value: toNumberOrZero(e.target.value),
											}))
										}
										placeholder="0"
									/>
								</div>

								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Target Value</div>
									<Input
										type="number"
										value={
											goal.target_value === null
												? ""
												: String(goal.target_value)
										}
										onChange={(e) =>
											setGoal((prev) => ({
												...prev,
												target_value: toNumberOrNull(e.target.value),
											}))
										}
										placeholder="(opsiyonel)"
									/>
								</div>

								<div className="col-span-12 md:col-span-4 space-y-2">
									<div className="text-sm font-medium">Unit</div>
									<Input
										type="text"
										value={goal.unit ?? ""}
										onChange={(e) =>
											setGoal((prev) => ({
												...prev,
												unit: e.target.value.trim().length
													? e.target.value
													: null,
											}))
										}
										placeholder="kg, %, hours..."
									/>
								</div>

								<div className="col-span-12 md:col-span-6 space-y-2">
									<div className="text-sm font-medium">Parent Goal Id</div>
									<Input
										type="number"
										value={
											goal.parent_goal_id === null
												? ""
												: String(goal.parent_goal_id)
										}
										onChange={(e) =>
											setGoal((prev) => ({
												...prev,
												parent_goal_id: toNumberOrNull(e.target.value) as
													| number
													| null,
											}))
										}
										placeholder="(opsiyonel)"
									/>
								</div>

								<div className="col-span-12 md:col-span-6">
									<div className="text-xs text-muted-foreground">
										Not: Parent Goal Id boşsa “root goal” kabul edebilirsin.
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-end gap-3">
								<Button
									variant="outline"
									type="button"
									onClick={() => setGoal(defaultGoal)}
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
									Kaydetmek için başlık zorunlu. Deadline seçtiysen deadline_at,
									diğerlerinde period_start + period_end seç.
								</div>
							)}
						</form>
					</CardContent>
				</Card>
			</div>
		</LocalizationProvider>
	);
}
