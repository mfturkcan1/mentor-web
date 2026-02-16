import { createFileRoute } from "@tanstack/react-router";
import { TodosListComponent } from "@/components/TodoListComponent";

export const Route = createFileRoute("/todos/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TodosListComponent />;
}
