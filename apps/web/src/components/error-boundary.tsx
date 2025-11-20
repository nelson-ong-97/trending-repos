import { Component, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		toast.error("An unexpected error occurred", {
			description: error.message || "Please refresh the page to try again.",
		});
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="container mx-auto px-4 py-8">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Something went wrong</AlertTitle>
						<AlertDescription className="mt-2">
							<p className="mb-4">
								{this.state.error?.message || "An unexpected error occurred. Please try again."}
							</p>
							<Button onClick={this.handleReset} variant="outline" size="sm">
								<RefreshCw className="h-4 w-4 mr-2" />
								Reload Page
							</Button>
						</AlertDescription>
					</Alert>
				</div>
			);
		}

		return this.props.children;
	}
}

