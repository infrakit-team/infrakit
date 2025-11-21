import { beforeEach, describe, expect, it } from "bun:test";
import type { KeyValue } from "@infrakit-team/modules/kv";

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

		it("stores and retrieves values", async () => {
			const setResult = await adapter.set({ key: "foo", value: "bar" });
			expect(setResult).toBe(true);

			const getValue = await adapter.get({ key: "foo" });
			expect(getValue).toBe("bar");

			const view = await adapter.dashboard.view({ key: "foo" });
			expect(view).toBeDefined();
			expect(view!.key).toBe("foo");
			expect(view!.value).toBe("bar");
			expect(typeof view!.meta.createdAtIso).toBe("string");

			const count = await adapter.dashboard.count();
			expect(count).toBe(1);
		});

		it("purges expired entries when retrieving with TTL", async () => {
			await adapter.set({
				key: "temp",
				value: "value",
				option: { timeToLiveInMs: 10 },
			});

			const getBeforeExpiry = await adapter.get({ key: "temp" });
			expect(getBeforeExpiry).toBe("value");

			await new Promise((resolve) => setTimeout(resolve, 20));

			const getAfterExpiry = await adapter.get({ key: "temp" });
			expect(getAfterExpiry).toBeUndefined();

			const count = await adapter.dashboard.count();
			expect(count).toBe(0);
		});

		it("deletes entries and reports deletion status", async () => {
			const delMissing = await adapter.del({ key: "missing" });
			expect(delMissing).toBe(false);

			await adapter.set({ key: "exists", value: "1" });

			const delExists = await adapter.del({ key: "exists" });
			expect(delExists).toBe(true);

			const getDeleted = await adapter.get({ key: "exists" });
			expect(getDeleted).toBeUndefined();

			const count = await adapter.dashboard.count();
			expect(count).toBe(0);
		});

		it("deletes multiple entries via deleteBulk", async () => {
			await adapter.set({ key: "a", value: "1" });
			await adapter.set({ key: "b", value: "2" });
			await adapter.set({ key: "c", value: "3" });

			const result = await adapter.dashboard.deleteBulk({ keys: ["a", "c"] });
			expect(result).toBe(true);

			const getA = await adapter.get({ key: "a" });
			expect(getA).toBeUndefined();

			const getC = await adapter.get({ key: "c" });
			expect(getC).toBeUndefined();

			const getB = await adapter.get({ key: "b" });
			expect(getB).toBe("2");

			const count = await adapter.dashboard.count();
			expect(count).toBe(1);
		});

		it("lists entries with pagination and returns count of all matches", async () => {
			await adapter.set({ key: "alpha", value: "1" });
			await adapter.set({ key: "beta", value: "2" });
			await adapter.set({ key: "gamma", value: "3" });

			const page = await adapter.dashboard.list({
				paginate: { pageSize: 2, pageIndex: 1 },
			});

			expect(page.count).toBe(3);
			expect(page.data).toHaveLength(1);
			expect(page.data[0].key).toBe("gamma");
		});

		it("filters entries by key case-insensitively", async () => {
			await adapter.set({ key: "ProjectAlpha", value: "1" });
			await adapter.set({ key: "projectBeta", value: "2" });
			await adapter.set({ key: "Gamma", value: "3" });

			const page = await adapter.dashboard.list({
				filter: { key: "project" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(page.count).toBe(2);
			expect(page.data.map((item) => item.key)).toEqual([
				"ProjectAlpha",
				"projectBeta",
			]);
		});

		it("sorts entries by key and value", async () => {
			await adapter.set({ key: "b", value: "20" });
			await adapter.set({ key: "a", value: "10" });
			await adapter.set({ key: "c", value: "15" });

			const sortByKeyDesc = await adapter.dashboard.list({
				sort: { key: "desc" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(sortByKeyDesc.data.map((item) => item.key)).toEqual([
				"c",
				"b",
				"a",
			]);

			const sortByValueAsc = await adapter.dashboard.list({
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
			await adapter.set({ key: "first", value: "1" });
			await new Promise((resolve) => setTimeout(resolve, 5));
			await adapter.set({ key: "second", value: "2" });

			const sortedAsc = await adapter.dashboard.list({
				sort: { created: "asc" },
				paginate: { pageSize: 10, pageIndex: 0 },
			});

			expect(sortedAsc.data.map((item) => item.key)).toEqual([
				"first",
				"second",
			]);

			const sortedDesc = await adapter.dashboard.list({
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
