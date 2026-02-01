import { createFileRoute } from "@tanstack/react-router";
import { GoalsListComponent } from "@/components/GoalsListComponent";

export const Route = createFileRoute("/goals/")({
	component: GoalsPage,
});

export default function GoalsPage() {
	return (
		<div className="min-h-[calc(100vh-2rem)] w-full flex flex-col items-center justify-center p-6">
			<GoalsListComponent />
		</div>
	);
}
