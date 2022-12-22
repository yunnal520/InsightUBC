import InsightFacade from "./InsightFacade";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import * as fs from "fs-extra";
import * as JSZip from "jszip";
import e from "express";

export default class Helpers {

	// Checks if the ID is valid
	public checkValidID(id: string) {
		if(id.includes("_")) {
			return Promise.reject(new InsightError("id contains underscores"));
		} else if(id.trim().length === 0) {
			return Promise.reject(new InsightError("id contains only whitespace"));
		}
	}

	public static initializeData(facade: InsightFacade) {
		// Create directory if it does not exist
		fs.mkdirpSync("./data");
		// read the existing directory
		let dirFiles = fs.readdirSync("./data/");

		dirFiles.forEach((curr) => {
			let readFile = fs.readFileSync(("./data/" + curr), "utf8");
			if (readFile !== "") {
				let jsonFile: any[] = [];
				jsonFile.concat(JSON.parse(readFile));
				facade.addDatasetMap(curr, jsonFile);
			}
		});
	}

	public static columnType(key: string) {
		let numbers = ["avg", "pass", "fail", "audit", "year", "Avg", "Pass", "Fail", "Audit", "Year",
					   "lat", "lon", "seats"];
		let strings = ["dept", "id", "instructor",  "title", "uuid", "Subject", "Course", "Professor", "Title",
					   "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
		if (numbers.includes(key)) {
			return "number";
		} else if (strings.includes(key)) {
			return "string";
		} else {
			return "error";
		}
	}

	public static dejankify(key: string): string {
		let out: string = "";
		// of all the ways to do it, this is probably the worst one
		switch(key) {
			case "avg":
				out = "Avg";
				break;
			case "pass":
				out = "Pass";
				break;
			case "fail":
				out = "Fail";
				break;
			case "audit":
				out = "Audit";
				break;
			case "year":
				out = "Year";
				break;
			case "dept":
				out = "Subject";
				break;
			case "id":
				out = "Course";
				break;
			case "instructor":
				out = "Professor";
				break;
			case "title":
				out = "Title";
				break;
			case "uuid":
				out = "id";
				break;
			default:
				out = key;
				break;
		}
		return out;
	}
}
