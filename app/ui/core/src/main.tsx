import "./main.css";
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { DashboardLayout } from "./component/layout";
import { HomeRoute } from "./routes/home";
import { KeyValueRoute } from "./routes/key-value";
import { config } from "./shared/config";

const root = document.getElementById("app");

if (root === null) {
	throw new Error("Couldn't mount");
}

render(
	() => (
		<Router base={config.basename} root={DashboardLayout}>
			<Route path="/" component={HomeRoute} />
			{config.enabledModules.keyValue && (
				<Route path="/key-value" component={KeyValueRoute} />
			)}
		</Router>
	),
	root,
);
