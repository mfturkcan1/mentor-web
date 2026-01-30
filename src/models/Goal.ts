export enum GoalPeriodType {
	MONTH = "Month",
	YEAR = "Year",
	DEADLINE = "Deadline",
}

export enum GoalStatus {
	PLANNED = "Planned",
	ACTIVE = "Active",
	DONE = "Done",
	CANCELED = "Canceled",
}

export enum GoalPriority {
	LOW = "Low",
	MEDIUM = "Medium",
	HIGH = "High",
	CRITICAL = "Critical",
}

export type GoalResponse = {
	id: number;
	title: string;
	description: string | null;
	period_type: GoalPeriodType;
	deadline_at: Date | null;
	period_start: Date | null;
	period_end: Date | null;
	status: GoalStatus;
	priority: GoalPriority;
	target_value: number | null;
	current_value: number;
	unit: string | null;
	parent_goal_id: number | null;
	create_date: Date;
	update_date: Date;
	delete_date: Date | null;
};

export type GoalRequestDto = {
	title: string;
	description: string | null;
	period_type: GoalPeriodType;
	deadline_at: Date | null;
	period_start: Date | null;
	period_end: Date | null;
	status: GoalStatus;
	priority: GoalPriority;
	target_value: number | null;
	current_value: number;
	unit: string | null;
	parent_goal_id: number | null;
};
