import { createFileRoute } from "@tanstack/react-router";
import MonthlySummaryComponent from "@/components/MonthlySummaryComponent";

export const Route = createFileRoute("/summary/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-[calc(100vh-2rem)] w-full flex flex-col items-center justify-center p-6">
			<MonthlySummaryComponent />
		</div>
	);
}
