import { createFileRoute } from "@tanstack/react-router";
import { RoutinesFormPage } from "@/components/RoutinesFormPage";

export const Route = createFileRoute("/daily-routines/")({
	component: RoutinesFormPage,
});
