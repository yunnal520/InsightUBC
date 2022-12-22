import InsightFacade from "./InsightFacade";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import QueryHelper from "./QueryHelper";

import Helpers from "./Helpers";
import Decimal from "decimal.js";

export default class ApplyHelper {

	public static aggregate(applyRule: any, groups: any[], kind: string) {
		let colName = Object.keys(applyRule)[0];
		let ruleKeyVal = applyRule[colName];
		let applyToken = Object.keys(ruleKeyVal)[0]; // operator
		let colToOperateOn = ruleKeyVal[applyToken]; // operatorcolumn
		// let dataCol = kind.concat("_").concat(colToOperateOn.split("_")[1]);

		let dataCol = colToOperateOn.split("_")[1];
		dataCol = (kind === "rooms") ? dataCol : Helpers.dejankify(dataCol);
		let tester = Helpers.columnType(colToOperateOn.split("_")[1]);
		switch(applyToken) {
			case "MAX":
				if (tester !== "number") {
					throw new InsightError("NaN");
				}
				return this.aggregateMax(dataCol, groups);
				break;
			case "MIN":
				if (tester !== "number") {
					throw new InsightError("NaN");
				}
				return this.aggregateMin(dataCol, groups);
				break;
			case "AVG":
				if (tester !== "number") {
					throw new InsightError("NaN");
				}
				return this.aggregateAvg(dataCol, groups);
				break;
			case "COUNT":
				return this.aggregateCount(dataCol, groups);
				break;
			case "SUM":
				if (tester !== "number") {
					throw new InsightError("NaN");
				}
				return this.aggregateSum(dataCol, groups);
				break;
			default:
				throw new InsightError("Invalid applytoken");
				break;
		}
	}

	public static aggregateMax(column: any, group: any[]) {
		let max = -Infinity;
		for (let i of group) {
			if (i[column] > max) {
				max = i[column];
			}
		}
		return max;
	}

	public static aggregateMin(column: any, group: any[]) {
		let min = Infinity;
		for (let i of group) {
			if (i[column] < min) {
				min = i[column];
			}
		}
		return min;
	}

	public static aggregateAvg(column: any, group: any[]) {
		let total = new Decimal(0);
		for (let i of group) {
			let curr = new Decimal(i[column]);
			total = Decimal.add(total, curr);
		}
		let avg = total.toNumber() / group.length;
		let res = Number(avg.toFixed(2));
		return res;
	}

	public static aggregateCount(column: any, group: any[]) {
		let count: any[] = [];
		for (let i of group) {
			if (!count.includes(i[column])) {
				count.push(i[column]);
			}
		}
		return count.length;
	}

	public static aggregateSum(column: any, group: any) {
		let total = new Decimal(0);
		for (let i of group) {
			let curr = new Decimal(i[column]);
			total = Decimal.add(total, curr);
		}
		let sum = total.toNumber();
		let res = sum.toFixed(2);
		return res;
	}

	public static applyValidator(query: any, column: any[]) {
		if (query === undefined) {
			throw new InsightError("Transform query is undefined");
		}
		let group = query.GROUP, apply = query.APPLY, out = [];
		if (group === undefined || apply === undefined) {
			throw new InsightError("GROUP or APPLY missing");
		}
		let applyDupeTesterArray = [];
		for (let rule of apply) {
			applyDupeTesterArray.push(Object.keys(rule)[0]);
		}
		if (new Set(applyDupeTesterArray).size !== applyDupeTesterArray.length) {
			throw new InsightError("APPLY contains duplicates");
		}

		let columnsPresentTesterArray = [];
		for (let g of group) {
			columnsPresentTesterArray.push(g);
		}
		for (let r of apply) {
			let temp: any = (Object.values(r)[0]);
			columnsPresentTesterArray.push(Object.values(temp)[0]);
			columnsPresentTesterArray.push(Object.keys(r)[0]);
		}
		for (let c of column) {
			if (!columnsPresentTesterArray.includes(c)) {
				throw new InsightError("Every COLUMN must be present in TRANSFORMATIONS");
			}
		}
	}
}
