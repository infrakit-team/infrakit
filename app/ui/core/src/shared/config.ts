// @ts-expect-error: It does exist
export const config = window.__INITIAL_STATE__ as {
	apiUrl: string;
	basename: string;
	enabledModules: {
		keyValue: boolean;
	};
};
