import { createFileRoute } from "@tanstack/react-router";
import { RoutinesFormPage } from "@/components/RoutinesFormPage";

export const Route = createFileRoute("/daily-routines/create")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-[calc(100vh-2rem)] w-full flex flex-col items-center justify-center p-6">
			<RoutinesFormPage />
		</div>
	);
}
