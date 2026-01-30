import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { useMatch } from "@tanstack/react-router";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
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
import type { Routine, RoutinePart, RoutineResponse } from "@/models/Routine";
import { AppDialog } from "./AppDialog";
import "dayjs/locale/tr";
dayjs.locale("tr");

export enum ViewMode {
	CREATE = "create",
	EDIT = "edit",
}

export function RoutinesFormPage() {
	const now = dayjs();
	const defaultRoutine: Routine = {
		title: `${now.format("D MMMM")} Rutinim`,
		parts: [],
		create_date: now,
	};

	const defaultRoutinePart: RoutinePart = {
		description: "",
		start_hour: now,
		end_hour: now,
		save_as_category: false,
	};
	const [appendRoutines, setAppendRoutines] = useState<RoutinePart[]>([]);
	const [newRoutine, setNewRoutine] = useState<RoutinePart>(defaultRoutinePart);
	const [routine, setRoutine] = useState<Routine>(defaultRoutine);
	const [categories, setCategories] = useState<string[]>([]);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const editMatch = useMatch({
		from: "/daily-routines/$routineId/edit",
		shouldThrow: false,
	});

	const isEdit = !!editMatch;

	const routineId = isEdit ? Number(editMatch.params.routineId) : undefined;
	const viewMode = isEdit ? ViewMode.EDIT : ViewMode.CREATE;

	const saveRoutine = async () => {
		console.log("Appending routines:", appendRoutines, routineId, viewMode);

		if (viewMode === ViewMode.EDIT && routineId) {
			if (appendRoutines.length === 0) return;
			// Update existing routine
			await axios.post(
				`http://localhost:5000/routine/parts/append?id=${routineId}`,
				appendRoutines,
			);
			return;
		}
		// Create new routine
		await axios.post("http://localhost:5000/routine", routine);
	};

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get<string[]>(
					"http://localhost:5000/category/names",
				);
				setCategories(res.data);
			} catch (e) {
				console.error(e);
			}
		})();
	}, []);

	useEffect(() => {
		if (viewMode !== ViewMode.EDIT || !routineId) return;

		(async () => {
			try {
				const res = await axios.get<RoutineResponse>(
					`http://localhost:5000/routine/${routineId}`,
				);

				const convertedParts = res.data.parts.map((part) => ({
					...part,
					start_hour: part.start_hour ? dayjs(part.start_hour) : null,
					end_hour: part.end_hour ? dayjs(part.end_hour) : null,
				}));

				setRoutine({
					title: res.data.title ?? "",
					parts: convertedParts ?? [],
					create_date: res.data.create_date
						? dayjs(res.data.create_date)
						: dayjs(),
				});

				if (convertedParts.length > 0) {
					const lastPart = convertedParts[convertedParts.length - 1];
					setNewRoutine({
						...newRoutine,
						start_hour: lastPart.end_hour,
						end_hour: lastPart.end_hour,
					});
				}
			} catch (e) {
				console.error(e);
			}
		})();
	}, [viewMode, routineId]);

	const calculateTotalDuration = (parts: RoutinePart[]) => {
		let totalMinutes = 0;
		parts.forEach((part) => {
			if (part.start_hour && part.end_hour) {
				let end = part.end_hour;
				if (end.isBefore(part.start_hour)) {
					end = end.add(1, "day");
				}
				totalMinutes += end.diff(part.start_hour, "minute");
			}
		});
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours}s ${minutes}dk`;
	};

	const calculateDuration = (
		start: dayjs.Dayjs | null,
		end: dayjs.Dayjs | null,
	) => {
		if (start && end) {
			if (end.isBefore(start)) {
				// assume next day
				end = end.add(1, "day");
			}
			const diff = end.diff(start, "minute");
			const hours = Math.floor(diff / 60);
			const minutes = diff % 60;
			return `${hours}s ${minutes}dk`;
		}
		return "-";
	};

	const canAdd =
		newRoutine.description.trim().length > 0 &&
		!!newRoutine.start_hour &&
		!!newRoutine.end_hour;

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<div className="min-h-[calc(100vh-2rem)] w-full flex items-center justify-center p-6">
				<Card className="w-full max-w-3xl shadow-sm">
					<CardHeader className="space-y-1">
						<CardTitle>Daily Routines</CardTitle>
						<CardDescription>
							Bir rutin grubu oluştur ve saat aralıklarıyla parçaları ekle.
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
								title="Rutini kaydet?"
								message=" Emin misiniz?"
								showCancel
								confirmText="Kaydet"
								cancelText="İptal"
								onClose={() => setSaveDialogOpen(false)}
								onConfirm={async () => {
									await saveRoutine();
									setSaveDialogOpen(false);
								}}
							/>
							<div className="space-y-2">
								<div className="text-sm font-medium">Başlık</div>
								<Input
									type="text"
									value={routine.title}
									placeholder="Title of the routine group"
									onChange={(e) =>
										setRoutine((prev) => ({
											...prev,
											title: e.target.value,
										}))
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<div className="text-sm font-medium">Rutin Tarihi</div>
									<DateTimePicker
										value={routine.create_date}
										format="DD/MM/YYYY HH:mm"
										onChange={(e) => {
											if (!e) {
												return;
											}
											setRoutine((prev) => ({
												...prev,
												create_date: e,
											}));
										}}
										viewRenderers={{
											hours: renderTimeViewClock,
											minutes: renderTimeViewClock,
											seconds: renderTimeViewClock,
										}}
									/>
								</div>

								<div className="text-sm font-medium self-end">
									Toplam Süre: {calculateTotalDuration(routine.parts)}
								</div>
							</div>

							<Separator />

							{/* Existing routines list */}

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="text-sm font-medium">Rutinler</div>
									<div className="text-xs text-muted-foreground">
										{routine.parts.length} aktivite
									</div>
								</div>

								{routine.parts.length === 0 ? (
									<div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
										Henüz rutin eklenmedi.
									</div>
								) : (
									<div className="rounded-md border">
										<div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground">
											<div className="col-span-6">Rutin</div>
											<div className="col-span-2">Başlangıç</div>
											<div className="col-span-2">Bitiş</div>
											<div className="col-span-2">Süre</div>
										</div>
										<Separator />
										<div className="divide-y">
											{routine.parts?.map((part, index) => (
												<div
													className="grid grid-cols-12 gap-2 px-3 py-3 items-center"
													key={`part_row_${part.id || index}`}
												>
													<Input
														className="col-span-6"
														type="text"
														value={part.description}
														placeholder="Routine name"
														disabled
													/>

													<div className="col-span-2 text-sm tabular-nums">
														{part.start_hour
															? part.start_hour.format("HH:mm")
															: "-"}
													</div>

													<div className="col-span-2 text-sm tabular-nums">
														{part.end_hour
															? part.end_hour.format("HH:mm")
															: "-"}
													</div>

													<div className="col-span-2 text-sm tabular-nums">
														{calculateDuration(part.start_hour, part.end_hour)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Add new routine row */}
							<div className="rounded-md border p-4 space-y-3">
								<div className="text-sm font-medium">Yeni rutin ekle</div>

								<div className="grid grid-cols-12 gap-3 items-end">
									<div className="col-span-12 md:col-span-6 space-y-2">
										<div className="text-xs text-muted-foreground">Rutin</div>
										<Autocomplete
											freeSolo
											value={newRoutine.description}
											options={categories}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Örn: Kahvaltı + Antrenman"
												/>
											)}
											onInputChange={(_, newInputValue) => {
												setNewRoutine((prev) => ({
													...prev,
													description: newInputValue,
												}));
											}}
										/>
									</div>

									<div className="col-span-6 md:col-span-2 space-y-2">
										<div className="text-xs text-muted-foreground">
											Başlangıç
										</div>
										<DesktopTimePicker
											ampm={false}
											value={newRoutine.start_hour}
											format="HH:mm"
											onChange={(e) =>
												setNewRoutine((prev) => ({
													...prev,
													start_hour: e,
												}))
											}
										/>
									</div>

									<div className="col-span-6 md:col-span-2 space-y-2">
										<div className="text-xs text-muted-foreground">Bitiş</div>
										<DesktopTimePicker
											ampm={false}
											value={newRoutine.end_hour}
											format="HH:mm"
											onChange={(e) =>
												setNewRoutine((prev) => ({ ...prev, end_hour: e }))
											}
										/>
									</div>

									<div className="col-span-6 md:col-span-1 space-y-2">
										<div className="text-xs text-muted-foreground">Kaydet</div>
										<Checkbox
											checked={newRoutine.save_as_category}
											onChange={(e) => {
												setNewRoutine((prev) => ({
													...prev,
													save_as_category: e.target.checked,
												}));
											}}
										/>
									</div>

									<div className="col-span-12 md:col-span-1">
										<Button
											className="w-full"
											type="button"
											variant="outline"
											disabled={!canAdd}
											onClick={() => {
												const f = {
													start_hour: newRoutine.start_hour,
													end_hour: newRoutine.end_hour,
													description: newRoutine.description?.trim(),
													save_as_category: newRoutine.save_as_category,
												};
												setRoutine((prev) => ({
													...prev,
													parts: [...prev.parts, f],
												}));
												if (viewMode === ViewMode.EDIT) {
													console.log(
														"append routes",
														appendRoutines,
														newRoutine,
													);
													setAppendRoutines([...appendRoutines, f]);
												}
												setNewRoutine({
													start_hour: f.end_hour,
													end_hour: f.end_hour,
													description: "",
													save_as_category: false,
												});

												if (!categories.includes(f.description)) {
													setCategories((prev) => [...prev, f.description]);
												}
											}}
										>
											Ekle
										</Button>
									</div>
								</div>

								{!canAdd && (
									<div className="text-xs text-muted-foreground">
										Eklemek için açıklama + başlangıç/end seç.
									</div>
								)}
							</div>

							<div className="flex items-center justify-end gap-3">
								<Button
									variant="outline"
									type="button"
									onClick={() => setSaveDialogOpen(true)}
								>
									Kaydet
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</LocalizationProvider>
	);
}
