import type { Dayjs } from "dayjs";

export type TodoSelectDto = {
	id: string;
	title: string;
	description: string | null;
	parent_goal_id: number | null;
	completed: boolean;
	completed_date: Dayjs | null; // ISO string
	deadline_date: string; // ISO string
	create_date: Dayjs; // ISO string
	update_date: Dayjs; // ISO string
	delete_date: Dayjs | null; // ISO string
};

export type NewTodo = {
	title: string;
	description: string | null;
	parent_goal_id: number | null;
	completed: boolean;
	completed_date: Dayjs | null; // send as ISO string
	deadline_date: Dayjs; // send as ISO string
};
