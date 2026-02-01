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

export enum GoalLifeCycle {
	SHORT_TERM = "ShortTerm",
	MEDIUM_TERM = "MediumTerm",
	LONG_TERM = "LongTerm",
	LIFE_TIME = "LifeTime",
}

export const GoalLifeCycleLabels: Record<GoalLifeCycle, string> = {
	[GoalLifeCycle.SHORT_TERM]: "1 Ay ve Altı Olan Hedef",
	[GoalLifeCycle.MEDIUM_TERM]: "1-3 Aylık Hedef",
	[GoalLifeCycle.LONG_TERM]: "3-12 Aylık Hedef",
	[GoalLifeCycle.LIFE_TIME]: "Ömür Boyu Hedef",
};

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
	goal_cycle: GoalLifeCycle;
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
	goal_cycle: GoalLifeCycle;
};
