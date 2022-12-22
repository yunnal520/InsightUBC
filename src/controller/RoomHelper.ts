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
import {Content} from "./Content";
import * as JSZip from "jszip";
import * as parse5 from "parse5";
import Room from "./Room";
import * as http from "http";

export default class RoomHelper{
	public async addRooms(zip: JSZip, id: string) {
		let roomsList = await this.listDataset(zip);
		RoomHelper.writeRoomJSONFile(id, roomsList);
		return roomsList;
	}

	public async listDataset(zip: JSZip) {
		let buildingList = await this.parseIndex(zip as JSZip);
		let roomsList = await this.parseFiles(zip as JSZip, buildingList);
		let roomDataset: any[] = [];
		let geoList: Array<Promise<any>> = [];
		for (let building of buildingList) {
			let latAndLon = this.getGeoLocation(building[2].trim());
			geoList.push(latAndLon);
		}

		let listLocation = await Promise.all(geoList);
		for (let i = 0; i < buildingList.length; i++) {
			let theBuilding = buildingList[i];
			let theRooms = roomsList[i];
			if (!theRooms[0]) {
				continue;
			} else {
				for (let r of theRooms) {
					let roomObj = {
						fullname: theBuilding[1],
						shortname: theBuilding[0],
						number: r[0],
						name: theBuilding[0] + "_" + r[0],
						address: theBuilding[2],
						lat: listLocation[i][0],
						lon: listLocation[i][1],
						seats: Number(r[1]),
						type: r[3],
						furniture: r[2],
						href: r[4]
					};
					roomDataset.push(roomObj);
				}
			}
		}
		return roomDataset;
	}

	// Referred to https://stackoverflow.com/questions/19539391/how-to-get-data-out-of-a-
	// node-js-http-get-request/56566138#56566138
	public async getGeoLocation(address: string) {
		let newAddress = address.replace(/\s/g, "%20");
		let link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team99/".concat(newAddress);
		let geoData: any[];
		// try {
		geoData = await this.makeAPICall(link);
		// } catch (err) {
		// 	throw err
		// }
		return geoData;
	}

	// Referred to https://stackoverflow.com/questions/19539391/how-to-get-data-out-of-a-
	// node-js-http-get-request/56566138#56566138
	public makeAPICall(link: string): Promise<any[]> {
		return new Promise((resolve, reject) => {
			http.get(link, (res) => {
				let dataLocation = new Array<Uint8Array>();
				res.on("data", (info) => {
					dataLocation.push(info);
				});
				res.on("end", () => {
					let dataset = JSON.parse(Buffer.concat(dataLocation).toString());
					resolve([dataset.lat, dataset.lon]);
				});
			}).on("error", (err) => {
				console.log("no lat or lon detected", err.message);
				reject(err);
			});
		});
	}

	// parse content inside index.htm and grab the list of buildings (shortname, fullname, and address)
	public async parseIndex(zip: JSZip) {
		await zip.file("index.htm");
		let indexFile = zip.file("index.htm");
		let listBuildings: any[] = [];
		let buildingList: any[];
		// if the indexFile does not exist/equal to null -> throw insight error
		// if the indexfile exists/is not null -> parse the content in the indexFile
		if (indexFile === null) {
			throw new InsightError("index file is null");
		} else {
			let indexContent = await indexFile.async("text");
			let parsedIndex = parse5.parse(indexContent);
			let traversedIndex = this.findTbody(parsedIndex);
			let buildings = this.traverseBuilding(traversedIndex,listBuildings);
			let filteredBuildings = this.filterList(buildings);
			buildingList = this.makeBuilding(filteredBuildings);
		}
		return buildingList;
	}

	public async parseFiles(zip: JSZip, listBuildingNames: any[]) {
		let roomsList: any[] = [];
		let paths: any[] = [];
		let room: any;
		let rooms: any = [];
		for (let building of listBuildingNames) {
			let bPath = building[3].slice(2);
			paths.push(bPath);
		}
		for (let path of paths) {
			room = zip.file(path);
			rooms.push(room);
		}
		let rList: Array<Promise<any>> = [];
		for (let r of rooms) {
			if (r === null) {
				throw new InsightError("building file is null");
			} else {
				rList.push(r.async("text"));
			}
		}
		let listR = await Promise.all(rList);
		for (let lr of listR) {
			let listRooms: any[] = [];
			let parsedBuilding = parse5.parse(lr);
			let btbody = this.findTbody(parsedBuilding);
			let traversedRooms = this.traverseRooms(btbody, listRooms);
			let filteredRooms = this.filterList(traversedRooms);
			let madeRooms = this.makeRoom(filteredRooms);
			roomsList.push(madeRooms);
		}
		return roomsList;
	}

	public static writeRoomJSONFile(idName: string, rooms: any[]) {
		let jsonFile = fs.writeJson("./data/" + idName + ".json", rooms);
		return jsonFile;
	}

	public findTbody(indexTree: any) {
		let cRes = 0;
		// if it is not tbody or does not contain the tbody, it would return 0;
		if (indexTree.nodeName === "tbody") {
			return indexTree;
		} else if (indexTree.childNodes === undefined || indexTree.childNodes.length === 0) {
			return 0;
		}
		// check each childnode of the index tree for the tbody
		for(let child of indexTree.childNodes) {
			let tChild = this.findTbody(child);
			// checking if it is tbody
			if (tChild !== 0) {
				cRes = tChild;
			}
		}
		return cRes;
	}

	public makeBuilding (listOfBuildings: string[]) {
		let bList: any[] = [];
		for (let i = 0; i < listOfBuildings.length; i += 4) {
			bList.push([listOfBuildings[i], listOfBuildings[i + 1], listOfBuildings[i + 2], listOfBuildings[i + 3]]);
		}
		return bList;
	}

	public makeRoom (listOfRooms: any[]) {
		let rList: any[] = [];
		for (let i = 0; i < listOfRooms.length; i += 5) {
			rList.push([listOfRooms[i], listOfRooms[i + 1],
				listOfRooms[i + 2], listOfRooms[i + 3], listOfRooms[i + 4]]);
		}
		return rList;
	}

	// List out the full names of the buildings
	public traverseBuilding(tbody: any, linkedBuildings: any[]) {
		if (tbody.nodeName ===  "td") {
			let tdChild = tbody.childNodes;
			for (let child of tdChild) {
				if (child.value !== undefined) {
					// shortname and address
					linkedBuildings.push(child.value);
				}
				if (child.nodeName === "a") {
					for (let aChild of child.childNodes){
						if (aChild.value !== undefined && aChild.value !== "More info") {
							// long name
							linkedBuildings.push(aChild.value);
							break;
						} else if (aChild.value !== undefined && aChild.value === "More info") {
							for (let ref of child.attrs) {
								if (ref.name === "href") {
									// href link/path
									linkedBuildings.push(ref.value);
								}
							}
						}
					}
				}
			}
		} else if (tbody.childNodes === undefined || tbody.childNodes.length === 0) {
			return [];
		}
		for (let child of tbody.childNodes) {
			let bChild = this.traverseBuilding(child, linkedBuildings);
			if (bChild.length !== 0) {
				linkedBuildings = bChild;
			}
		}
		return linkedBuildings;
	}

	// traverse through the rooms and access td
	public traverseRooms(tbody: any, listRooms: any[]) {
		// console.log(name);
		for (let tChild in tbody.childNodes) {
			let tr = tbody.childNodes[tChild];
			if (tr.nodeName === "tr") {
				for (let td of tr.childNodes) {
					if (td.nodeName === "td") {
						for (let tdChild of td.childNodes) {
							if (tdChild.value !== undefined) {
								// capacity, furniture type, class type
								listRooms.push(tdChild.value);
							}
							if (tdChild.nodeName === "a") {
								for (let aChild of tdChild.childNodes) {
									if (aChild.value !== undefined && aChild.value !== "More info") {
										// room number
										listRooms.push(aChild.value);
										break;
									} else if (aChild.value !== undefined && aChild.value === "More info") {
										for (let attrs of tdChild.attrs) {
											if (attrs.name === "href") {
												// link
												listRooms.push(attrs.value);
											}
										}
									}
								}
							}
						}
					}
				}
			} else if (tbody.childNodes === undefined || tbody.childNodes.length === 0) {
				return [];
			}
			for (let child of tbody.childNodes) {
				let bChild = this.traverseRooms(child, listRooms);
				if (bChild.length !== 0) {
					listRooms = bChild;
				}
			}
		}
		return listRooms;
	}

	// Filter list of names
	public filterList(listBuilding: any[]) {
		let buildings: any[];
		buildings = listBuilding.map((el) => el.trim());
		buildings = buildings.filter((word: any) => word);
		return buildings;
	}
}
