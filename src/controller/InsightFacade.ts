import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";

import Helpers from "./Helpers";
import QueryHelper from "./QueryHelper";

import * as fs from "fs-extra";
import * as JSZip from "jszip";
import SectionHelper from "./SectionHelper";
import Section from "./Section";
import RoomHelper from "./RoomHelper";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	// private datasets: Dataset[];
	private insightDatasetMap: Map<string, InsightDataset>;
	private datasetMap: Map<string, any[]>;

	constructor() {
		this.insightDatasetMap = new Map<string, InsightDataset>();
		this.datasetMap = new Map<string, any[]>();
		console.log("InsightFacadeImpl::init()");
	}

	public addDatasetMap(id: string, array: any[]) {
		return this.datasetMap.set(id, array);
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (id.includes("_") || /\s/g.test(id)) {
			// if condition referenced: https://stackoverflow.com/questions/1731190/check-if-a-string-has-white-space
			return Promise.reject(new InsightError("id is whitespace or contains underscores"));
		}
		Helpers.initializeData(this);
		let result = JSZip.loadAsync(content, {base64: true})
			.then(async (zip) => {
				if (kind === InsightDatasetKind.Sections) {
					await zip.folder("courses");
					let section = new SectionHelper();
					let sectionsList = await section.addSection(zip as JSZip, id);
					let rows = sectionsList.length;
					if (rows === 0) {
						throw new InsightError("No valid sections");
					}
					let insightDataset: InsightDataset = {id: id, kind: kind, numRows: rows};
					this.datasetMap.set(id, sectionsList);
					this.insightDatasetMap.set(id, insightDataset);
					let output: string[] = [];
					for (let curr of this.datasetMap.keys()) {
						if (curr != null) {
							output.push(curr as string);
						}
					}
					return Promise.resolve(output);
				} else if (kind === InsightDatasetKind.Rooms) {
					let rooms = new RoomHelper();
					let roomsList = await rooms.addRooms(zip as JSZip, id);
					let rows = roomsList.length;
					if (rows === 0) {
						throw new InsightError("No valid rooms");
					}
					let insightDataset: InsightDataset = {id: id, kind: kind, numRows: rows};
					this.datasetMap.set(id, roomsList);
					this.insightDatasetMap.set(id, insightDataset);
					let output: string[] = [];
					for (let curr of this.datasetMap.keys()) {
						if (curr != null) {
							output.push(curr as string);
						}
					}
					return Promise.resolve(output);
				}
			})
			// Catch error if there is an invalid zip file
			.catch(function (err) {
				return Promise.reject(new InsightError("invalid zip file"))	;
			});
		return result as Promise<string[]>;
	}


	public removeDataset(id: string): Promise<string> {
		// Check for underscore and whitespace in id
		if(id.includes("_")) {
			return Promise.reject(new InsightError("id contains underscores"));
		} else if(/\s/g.test(id)) {
			// if condition referenced: https://stackoverflow.com/questions/1731190/check-if-a-string-has-white-space
			return Promise.reject(new InsightError("id contains only whitespace"));
		}

		// Check if id exists, if it does remove the id
		let temp: string;
		if (this.datasetMap.has(id)) {
			temp = id;
			this.datasetMap.delete(id);
		} else {
			return Promise.reject(new NotFoundError("id does not exist"));
		}

		// remove folder corresponding to datasets in /data
		fs.rmSync(("./data/" + id), {recursive: true, force: true});

		return Promise.resolve(temp);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// Ensure proper JSON
		let newQuery = JSON.stringify(query);
		try {
			JSON.parse(newQuery);
		} catch (err) {
			return Promise.reject(new InsightError("invalid query"));
		}
		let jsonQuery = JSON.parse(newQuery);

		// make sure query is valid
		if (!QueryHelper.validDatasetQuery(jsonQuery)) {
			return Promise.reject(new InsightError("WHERE or OPTIONS not included"));
		}

		// Commenting for my memory
		// let whereQuery = jsonQuery.WHERE;
		let columnQuery = jsonQuery.OPTIONS.COLUMNS;
		// let orderQuery = jsonQuery.OPTIONS.ORDER;
		// let transformQuery = jsonQuery.TRANSFORMATIONS
		let datasetName = jsonQuery.OPTIONS.COLUMNS[0].split("_")[0];
		let datasetToQuery: any[] = [];
		let output: InsightResult[] = [];

		// make sure dataset exists && load into memory
		if (this.datasetMap.has(datasetName)) {
			let mapResult = this.datasetMap.get(datasetName);
			datasetToQuery = (mapResult !== undefined) ? mapResult : datasetToQuery;
		} else {
			return Promise.reject(new InsightError("dataset does not exist"));
		}

		let datasetKind = (Object.prototype.hasOwnProperty.call(datasetToQuery[0], "Professor") ? "sections" : "rooms");
		try {
			// filter what data we're returning based on WHERE
			output = QueryHelper.parseQueryWHERE(datasetToQuery, jsonQuery.WHERE, datasetName);
			// filter what columns of the dataset we're returning
			if (!jsonQuery.TRANSFORMATIONS) {
				output = QueryHelper.parseQueryCOLUMNS(output, columnQuery, datasetName);
			}
			// console.log("HEJRHEJKRHEJK")
			// console.log(output);
			// apply transformations (if they exist)
			if (jsonQuery.TRANSFORMATIONS) {
				output = QueryHelper.parseQueryTRANSFORM(output, jsonQuery.TRANSFORMATIONS, datasetKind, columnQuery);
			}
			// sort datasets by the given parameters
			if (jsonQuery.OPTIONS.ORDER) {
				output = QueryHelper.parseQueryORDER(output, jsonQuery.OPTIONS.ORDER, columnQuery, datasetName);
			}
		} catch(err) {
			return Promise.reject(err);
		}

		// Check if result exceeds a max size of 5000
		if (output.length > 5000) {
			return Promise.reject(new ResultTooLargeError("over 5000 elements"));
		}
		// output the result
		return Promise.resolve(output);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let output: InsightDataset[] = [];
		this.insightDatasetMap.forEach((value: InsightDataset, key: string) => {
			output.push(value);
		});
		return Promise.resolve(output);
	}
}
