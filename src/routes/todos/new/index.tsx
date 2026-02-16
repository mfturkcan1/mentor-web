import { createFileRoute } from "@tanstack/react-router";
import { TodosFormPage } from "@/components/TodosFormPage";

export const Route = createFileRoute("/todos/new/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TodosFormPage />;
}
