import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";

import * as fs from "fs-extra";
import * as JSZip from "jszip";
import InsightFacade from "./InsightFacade";
import Section from "./Section";

export default class SectionHelper {
	// Helper function copied from the big addDataset function orignally in InsighFacade
	public async addSection(zip: JSZip, id: string) {
		if (!zip.folder(/courses/)) {
			Promise.reject(new InsightError("zip root directory is not 'courses'"));
		}
		let courseList: Array<Promise<string>> = [];
		zip.forEach((relativePath, file) => {
			courseList.push(file.async("text"));
		});

		let sectionsList;
		sectionsList = await Promise.all(courseList).then((res) => {
			let temp = SectionHelper.parseSections((res));
			// console.log(temp)
			return temp;
		});

		// let rows;
		// rows = await Promise.all(courseList).then((res) => {
		// 	let temp = SectionHelper.numRowsSections((res));
		// 	return temp;
		// });

		SectionHelper.writeSectionJSONFile(id, sectionsList);
		return sectionsList;
	}

	// checks if the query keys are valid
	public static sectionQueryKeyChecker(keys: string[]) {
		let queryKeys = ["Avg", "Pass", "Fail", "Audit", "Year", "Subject", "Course", "Professor", "Title",  "id"];
		return queryKeys.every(function (queryKey) {
			return keys.includes(queryKey);
		});
	}

	/**
	 * Parse list of courses for sections, returns a list of sections as valid JSON files
	 *
	 * @param courses a list of strings
	 *
	 * @return []
	 *
	 */
	public static parseSections(courses: string[]): any[] {

		// every course (CHEM121....) contains a list of sections (result: [{section1}, {section2}...])
		// parse every course for sections, return a list of json
		// parseSections returns an array like [{section1}, {section2}...]
		let result: any = [];
		let first = true;
		courses.forEach((curr) => {
			if (first) {
				first = false;
			} else {
				let obj = JSON.parse(curr as string);
				let res = obj.result;
				// Checking if JSON contains all the keys in query
				for(let r of res) {
					if (SectionHelper.sectionQueryKeyChecker(Object.keys(r))) {
						result.push(r);
					}
				}
			}
		});
		// console.log(result);
		return result;
	}

	/**
	 * Return the number of rows there are
	 *
	 * @param courses a list of strings
	 *
	 * @return int
	 *
	 */
	public static numRowsSections(courses: string[]) {
		let numRows = 0;
		let first = true;

		courses.forEach((curr) => {
			if (first) {
				first = false;
			} else {
				let tempRow;
				let obj = JSON.parse(curr as string);
				tempRow = Object.keys(obj["result"]).length;
				numRows += tempRow;
			}
		});
		return numRows;
	}

	/**
	 * combine the list of sections into one single long JSON file
	 *
	 * @param sections a list of sections
	 * @param idName string
	 *
	 * @return JSON File
	 *
	 */
	public static writeSectionJSONFile(idName: string, sections: any[]) {
		let jsonFile = fs.writeJson("./data/" + idName + ".json", sections);
		return jsonFile;
	}
}
