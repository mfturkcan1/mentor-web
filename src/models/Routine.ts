import type { Dayjs } from "dayjs";

export type RoutineOnlyResponse = {
	id: number;
	title: string;
	create_date: string;
	update_date?: string;
	delete_date?: string;
};

export type Routine = {
	title: string;
	parts: RoutinePart[];
	create_date: Dayjs;
};

export type RoutinePart = {
	id?: number | null;
	start_hour: Dayjs | null;
	end_hour: Dayjs | null;
	description: string;
	save_as_category: boolean;
};

export type RoutineResponse = {
	title: string;
	parts: RoutinePart[];
	create_date: Date;
};

export type RoutinePartResponse = {
	id?: number | null;
	start_hour: Date | null;
	end_hour: Date | null;
	description: string;
	save_as_category: boolean;
};
