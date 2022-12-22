import InsightFacade from "./InsightFacade";
import {
	InsightError,
} from "./IInsightFacade";

import Helpers from "./Helpers";
import ApplyHelper from "./ApplyHelper";

export default class QueryHelper {
	public static validDatasetQuery(query: any): boolean {
		let keys = Object.keys(query);
		if (!(keys.length === 2 || keys.length === 3)) {
			return false;
		}
		if (!keys.includes("WHERE")) {
			return false;
		}
		if (!keys.includes("OPTIONS")) {
			return false;
		}
		if (Object.keys(query.OPTIONS)[0] !== "COLUMNS") {
			return false;
		}
		if (Object.keys(query.OPTIONS).length === 2 && Object.keys(query.OPTIONS)[1] !== "ORDER") {
			return false;
		}
		return true;
	}

	public static parseQueryWHERE(dataset: any[], query: any, id: string): any[] {
		let jsonQuery = query;

		if (jsonQuery.AND) {
			return this.parseQueryAND(dataset, jsonQuery.AND, id);
		} else if (jsonQuery.OR) {
			return this.parseQueryOR(dataset, jsonQuery.OR, id);
		} else if (jsonQuery.NOT) {
			return this.parseQueryNOT(dataset, jsonQuery.NOT, id);
		} else {
			if (jsonQuery.LT) {
				let key = Object.keys(jsonQuery.LT)[0];
				let num = jsonQuery.LT[key];
				let col = Helpers.dejankify(key.split("_")[1]);
				if (key.split("_")[0] !== id) {
					throw new InsightError("multiple dataset IDs detected");
				}
				return this.parseQueryLT(dataset, num, col);
			} else if (jsonQuery.GT) {
				let key = Object.keys(jsonQuery.GT)[0];
				let num = jsonQuery.GT[key];
				let col = Helpers.dejankify(key.split("_")[1]);
				if (key.split("_")[0] !== id) {
					throw new InsightError("multiple dataset IDs detected");
				}
				return this.parseQueryGT(dataset, num, col);
			} else if (jsonQuery.EQ) {
				let key = Object.keys(jsonQuery.EQ)[0];
				let num = jsonQuery.EQ[key];
				let col = Helpers.dejankify(key.split("_")[1]);
				if (key.split("_")[0] !== id) {
					throw new InsightError("multiple dataset IDs detected");
				}
				return this.parseQueryEQ(dataset, num, col);
			} else if (jsonQuery.IS) {
				let key = Object.keys(jsonQuery.IS)[0];
				let input = jsonQuery.IS[key];
				let col = Helpers.dejankify(key.split("_")[1]);
				if (key.split("_")[0] !== id) {
					throw new InsightError("multiple dataset IDs detected");
				}
				return this.parseQueryIS(dataset, input, col, id);
			} else {
				throw new InsightError("invalid filter key");
			}
		}
	}

	public static parseQueryAND(dataset: any[], query: any, id: string): any[] {
		if (query !== null || query !== undefined) {
			let output: any[] = [];
			for (let i of query) {
				output.push(this.parseQueryWHERE(dataset, i, id));
			}
			return output.reduce((a, b) => a.filter(((value: any) => b.includes(value))));;
		} else {
			throw new InsightError("AND parsing failed, query is null or undefined");
		}
	}

	public static parseQueryOR(dataset: any[], query: any, id: string): any[] {
		if (query !== null || query !== undefined) {
			let resultArray: any[] = [];
			for (let i of query) {
				resultArray = resultArray.concat(this.parseQueryWHERE(dataset, i, id));
			}
			return Array.from(new Set(resultArray));
		} else {
			throw new InsightError("OR parsing failed, query is null or undefined");
		}
	}

	public static parseQueryNOT(dataset: any[], query: string, id: string): any[] {
		if (query !== null || query !== undefined) {
			let resultArray: any[] = [];
			resultArray = resultArray.concat(this.parseQueryWHERE(dataset, query, id));
			let unfiltered = [...new Set(resultArray)];
			return dataset.filter((a) => !unfiltered.includes(a));
		} else {
			throw new InsightError("NOT parsing failed, query is null or undefined");
		}
	}

	public static parseQueryLT(dataset: any[], num: number, col: string): any[] {
		if (Helpers.columnType(col) === "number" && typeof (num) === "number") {
			return dataset.filter((a) => a[col] < num);
		} else {
			throw new InsightError("LT parsing failed: invalid key");
		}
	}

	public static parseQueryGT(dataset: any[], num: number, col: string): any[] {
		if (Helpers.columnType(col) === "number" && typeof num === "number") {
			return dataset.filter((a) => a[col] > num);
		} else {
			throw new InsightError("GT parsing failed: invalid key");
		}
	}

	public static parseQueryEQ(dataset: any[], num: number, col: string): any[] {
		if (Helpers.columnType(col) === "number" && typeof (num) === "number") {
			return dataset.filter((a) => a[col] === num);
		} else {
			throw new InsightError("EQ parsing failed: invalid key");
		}
	}


	public static parseQueryIS(dataset: any[], input: string, col: string, id: string): any[] {
		if (Helpers.columnType(col) === "string" && typeof (input) === "string") {
			if (input.includes("*")) {
				return this.parseQueryWildcard(dataset, input, col, id);
			} else {
				return dataset.filter((a) => a[col] === input);
			}
		} else {
			throw new InsightError("IS parsting failed: invalid key");
		}
	}

	public static parseQueryWildcard(dataset: any[], input: string, col: string, id: string): any[] {
		// let col = (id + "_" + col);
		if (input.startsWith("*") && input.endsWith("*")) {
			let tester = new RegExp(input.substring(1, input.length - 1));
			return dataset.filter((a) => tester.test(a[col]));
		} else if (input.startsWith("*")) {
			let tester = input.substring(1);
			return dataset.filter((a) => a[col].endsWith(tester));
		} else if (input.endsWith("*")) {
			let tester = input.substring(0, input.length - 1);
			return dataset.filter((a) => a[col].startsWith(tester));
		} else {
			throw new InsightError("what? wildcard error");
		}
	}

	public static parseQueryCOLUMNS(dataset: any[], query: any, id: string): any[] {
		for (let i in query) {
			if (query[i].split("_")[0] !== id) {
				throw new InsightError("multiple datasets detected");
				continue;
			} else if (Helpers.columnType(query[i].split("_")[1]) === "error") {
				throw new InsightError("invalid column type");
			}
		}
		let output = [];
		for (let i of dataset) {
			let truncatedSection: {[key: string]: any} = {};
			for (let j in query) {
				let title = (id + "_" + query[j].split("_")[1]);
				truncatedSection[title] = i[Helpers.dejankify(query[j].split("_")[1])];
			}
			output.push(truncatedSection);
		}
		return output;
	}

	public static parseQueryORDER(dataset: any[], query: any, columns: any, id: string): any[] {
		if (typeof query !== "object") {
			if (query.includes("_") && query.split("_")[0] !== id) {
				throw new InsightError("multiple datasets detected");
			} else if(!columns.includes(query)) {
				throw new InsightError("ORDER key must be included in COLUMNS key");
			} else {
				return dataset.sort((a, b) => {
					if (a[query] < b[query]) {
						return -1;
					}
					if (a[query] > b[query]) {
						return 1;
					}
					return 0;
				});
			}
		} else {
			let orderKeys = query.keys;
			if (!(query.dir === "DOWN" || query.dir === "UP")) {
				throw new InsightError("ORDER direction not UP or DOWN");
			}
			let dir = (query.dir === "DOWN" ? 1 : -1);
			return dataset.sort((a, b): any => {
				for (let key of orderKeys) {
					if (a[key] > b[key]) {
						return -dir;
					} else if (a[key] < b[key]) {
						return dir;
					} else {
						return 0;
					}
				}
			});
		}
	}

	public static parseQueryTRANSFORM(dataset: any[], query: any, kind: string, column: any[]): any[] {
		let group = query.GROUP, apply = query.APPLY, out = [];
		ApplyHelper.applyValidator(query, column);

		let map = new Map<string, any[]>();
		for (let d of dataset) {
			let key: string = "";
			for (let g of group) {
				let tempStr = g.split("_")[1];
				key = key.concat(d[tempStr]);
			}
			if (map.has(key)) {
				map.get(key)?.push(d);
			} else {
				let newGroup: any[] = [d];
				map.set(key, newGroup);
			}
		}
		let tempArr: any[][] = [];
		map.forEach((key) => {
			tempArr.push(key);
		});

		let groupedObjects = tempArr;
		for (let g of groupedObjects) {
			let toPush: any = {};
			for (let rule of apply) {
				// this way is probably better
				let name = Object.keys(rule)[0];
				if (!column.includes(name)) {
					continue;
				}
				let appliedTransformation = ApplyHelper.aggregate(rule, g, kind);
				toPush[name] = appliedTransformation;
			}
			for (let c of column) {
				if(c.includes("_")) {
					let finalColumn = kind.concat("_").concat(c.split("_")[1]);
					toPush[finalColumn] = g[0][finalColumn.split("_")[1]];
				}
			}
			out.push(toPush);
		}
		return out;
	}
}
