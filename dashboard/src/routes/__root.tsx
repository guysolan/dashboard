import {
	Link,
	Outlet,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: RootComponent,
	notFoundComponent: () => {
		return (
			<div>
				<p>This is the notFoundComponent configured on root route</p>
				<Link to="/">Start Over</Link>
			</div>
		);
	},
});

function RootComponent() {
	return (
		<>
			<Outlet />
			<Toaster />

			{/* <ReactQueryDevtools buttonPosition="top-right" /> */}
			{/* <TanStackRouterDevtools position="bottom-right" /> */}
		</>
	);
}
