import { createFileRoute } from "@tanstack/react-router";
import { GoalsListComponent } from "@/components/GoalsListComponent";
import MonthlySummaryComponent from "@/components/MonthlySummaryComponent";
import RoutineListComponent from "@/components/RouteListComponent";
import { TodosListComponent } from "@/components/TodoListComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ReminderOfTheDayCard() {
	// Later you can fetch this from your backend and cache it daily.
	const quotes = [
		{
			id: 1,
			text: "It is not about satisfaction or happiness. It is about duty. It is about doing what needs to be done. What is my duty in this world? To become who I am meant to be.",
			author: "Me",
			tag: "Goal Diagnosis",
		},
		{
			id: 2,
			text: "For what purpose humanity is there should not even concern us: why you are there, that you should ask yourself: and if you have no ready answer, then set for yourself goals, high and noble goals, and perish in pursuit of them! I know of no better life purpose than to perish in attempting the great and the impossible.",
			author: "Friedrich Nietzsche",
			tag: "Goal Diagnosis",
		},
	];

	return (
		<Card style={{ width: 1400 }} className="mb-5">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<CardTitle className="text-base">Reminder of the day</CardTitle>
						{/* <CardDescription>Small reminder before you start.</CardDescription> */}
					</div>
					<span className="text-xs text-muted-foreground rounded-md border px-2 py-1">
						{quotes[0].tag}
					</span>
				</div>
			</CardHeader>

			{quotes.map((quote, index) => (
				<CardContent key={`quote-card-${quote.id}`} className="pt-0">
					<blockquote className="rounded-lg border bg-muted/30 p-4">
						<p className="text-sm leading-relaxed">“{quote.text}”</p>
						{quote.author && (
							<footer className="mt-2 text-xs text-muted-foreground">
								— {quote.author}
							</footer>
						)}
					</blockquote>
				</CardContent>
			))}
		</Card>
	);
}

export const Route = createFileRoute("/")({
	component: App,
});

export default function App() {
	return (
		<div className="min-h-[calc(100vh-2rem)] w-full flex flex-col items-center justify-center p-6">
			<TodosListComponent />
			<Separator className="my-10" />
			<MonthlySummaryComponent />
			<Separator className="my-10" />
			<RoutineListComponent />
			<Separator className="my-10" />
			<ReminderOfTheDayCard />
			<Separator className="my-10" />
			<GoalsListComponent />
		</div>
	);
}
