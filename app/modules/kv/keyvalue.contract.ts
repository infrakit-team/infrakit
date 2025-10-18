import { beforeEach, describe, expect, it } from "bun:test";
import type { KeyValue } from "./interface";

export type KeyValueAdapterFactory = () => KeyValue;

export const runKeyValueAdapterContractTests = (
	name: string,
	createAdapter: KeyValueAdapterFactory,
) => {
	describe(name, () => {
		let adapter: KeyValue;

		beforeEach(() => {
			adapter = createAdapter();
		});

		it("stores and retrieves values", () => {
			const setResult = adapter.set({ key: "foo", value: "bar" });
			expect(setResult).toBe(true);

			expect(adapter.get({ key: "foo" })).toBe("bar");

			const view = adapter.dashboard.view({ key: "foo" });
			expect(view).toBeDefined();
			expect(view!.key).toBe("foo");
			expect(view!.value).toBe("bar");
			expect(typeof view!.meta.createdAtIso).toBe("string");

			expect(adapter.dashboard.count()).toBe(1);
		});

		it("purges expired entries when retrieving with TTL", async () => {
			adapter.set({
				key: "temp",
				value: "value",
				option: { timeToLiveInMs: 10 },
			});

			expect(adapter.get({ key: "temp" })).toBe("value");

			await new Promise((resolve) => setTimeout(resolve, 20));

			expect(adapter.get({ key: "temp" })).toBeUndefined();
			expect(adapter.dashboard.count()).toBe(0);
		});

		it("deletes entries and reports deletion status", () => {
			expect(adapter.del({ key: "missing" })).toBe(false);

			adapter.set({ key: "exists", value: "1" });
			expect(adapter.del({ key: "exists" })).toBe(true);
			expect(adapter.get({ key: "exists" })).toBeUndefined();
			expect(adapter.dashboard.count()).toBe(0);
		});

		it("deletes multiple entries via deleteBulk", () => {
			adapter.set({ key: "a", value: "1" });
			adapter.set({ key: "b", value: "2" });
			adapter.set({ key: "c", value: "3" });

			const result = adapter.dashboard.deleteBulk({ keys: ["a", "c"] });
			expect(result).toBe(true);

			expect(adapter.get({ key: "a" })).toBeUndefined();
			expect(adapter.get({ key: "c" })).toBeUndefined();
			expect(adapter.get({ key: "b" })).toBe("2");
			expect(adapter.dashboard.count()).toBe(1);
		});

		it("lists entries with pagination and returns count of all matches", () => {
			adapter.set({ key: "alpha", value: "1" });
			adapter.set({ key: "beta", value: "2" });
			adapter.set({ key: "gamma", value: "3" });

			const page = adapter.dashboard.list({
				paginate: { pageSize: 2, pageIndex: 1 },
			});

			expect(page.count).toBe(3);
			expect(page.data).toHaveLength(1);
			expect(page.data[0].key).toBe("gamma");
		});

		it("filters entries by key case-insensitively", () => {
			adapter.set({ key: "ProjectAlpha", value: "1" });
			adapter.set({ key: "projectBeta", value: "2" });
			adapter.set({ key: "Gamma", value: "3" });

			const page = adapter.dashboard.list({
				filter: { key: "project" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(page.count).toBe(2);
			expect(page.data.map((item) => item.key)).toEqual([
				"ProjectAlpha",
				"projectBeta",
			]);
		});

		it("sorts entries by key and value", () => {
			adapter.set({ key: "b", value: "20" });
			adapter.set({ key: "a", value: "10" });
			adapter.set({ key: "c", value: "15" });

			const sortByKeyDesc = adapter.dashboard.list({
				sort: { key: "desc" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(sortByKeyDesc.data.map((item) => item.key)).toEqual([
				"c",
				"b",
				"a",
			]);

			const sortByValueAsc = adapter.dashboard.list({
				sort: { value: "asc" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(sortByValueAsc.data.map((item) => item.value)).toEqual([
				"10",
				"15",
				"20",
			]);
		});

		it("sorts entries by creation time", async () => {
			adapter.set({ key: "first", value: "1" });
			await new Promise((resolve) => setTimeout(resolve, 5));
			adapter.set({ key: "second", value: "2" });

			const sortedAsc = adapter.dashboard.list({
				sort: { created: "asc" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(sortedAsc.data.map((item) => item.key)).toEqual([
				"first",
				"second",
			]);

			const sortedDesc = adapter.dashboard.list({
				sort: { created: "desc" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(sortedDesc.data.map((item) => item.key)).toEqual([
				"second",
				"first",
			]);
		});
	});
};
