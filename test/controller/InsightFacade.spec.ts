import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import {clearDisk, getContentFromArchives} from "../resources/TestUtil";
import chaiAsPromised from "chai-as-promised";
import {folderTest} from "@ubccpsc310/folder-test";
import RoomHelper from "../../src/controller/RoomHelper";
import Room from "../../src/controller/Room";

use(chaiAsPromised);

type Input = unknown;
type Output = Promise<InsightResult[]>;
type Error = any;

//
describe("InsightFacade", function () {
	let courses: string;
	let invalidCourse: string;
	let invalidZip: string;
	let roomsZip: string;

	before(function () {
		courses = getContentFromArchives("pair.zip");
		// invalidCourse = getContentFromArchives("invalidSections.zip");
		// invalidZip = getContentFromArchives("ADHE330");
		roomsZip = getContentFromArchives("rooms.zip");
	});

	// describe("List Datasets", function () {
	// 	let facade: IInsightFacade;

	// 	beforeEach( function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 	});

	// 	it ("should list no datasets", function () {
	// 		return facade.listDatasets().then((insightDatasets) => {
	// 			expect(insightDatasets).to.be.an.instanceof(Array);
	// 			expect(insightDatasets).to.have.length(0);
	// 		});
	// 	});

	// 	it ("should list one dataset", function () {
	// 		// 1. Add a dataset
	// 		// 2. List datasets again
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then ((addedIds) => facade.listDatasets())
	// 			.then((insightDatasets) => {
	// 				expect(insightDatasets).to.deep.equal([{
	// 					id:"courses",
	// 					kind: InsightDatasetKind.Sections,
	// 					numRows: 64612,
	// 				}]);
	// 			});
	// 	});

	// 	it ("should list multiple datasets", function () {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.addDataset("courses-2", courses, InsightDatasetKind.Sections);
	// 			})
	// 			.then(() => {
	// 				return facade.listDatasets();
	// 			})
	// 			.then((insightDatasets) => {
	// 				expect(insightDatasets).to.be.an.instanceof(Array);
	// 				expect(insightDatasets).to.have.length(2);
	// 				const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
	// 				expect(insightDatasetCourses).to.exist;
	// 				expect(insightDatasetCourses).to.deep.equal({
	// 					id:"courses",
	// 					kind: InsightDatasetKind.Sections,
	// 					numRows: 64612,
	// 				});
	// 			});
	// 	});
	// });
//
// 	describe("Add Datasets", function () {
// 		let facade: IInsightFacade;
//
// 		beforeEach( function () {
// 			clearDisk();
// 			facade = new InsightFacade();
// 		});
//
// 	// 	it("should fulfill with a string array", function () {
// 	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
// 	// 			.then(() => {
// 	// 				return facade.addDataset("coures-2", courses, InsightDatasetKind.Sections);
// 	// 			})
// 	// 			.then((insightDataset) => {
// 	// 				expect(insightDataset).to.have.length(2);
// 	// 				expect(insightDataset).to.be.an.instanceof(Array);
// 	// 				insightDataset.forEach(function(item) {
// 	// 					expect(item).to.be.a("string");
// 	// 				});
// 	// 			});
// 	// 	});
//
// 		it("should contain the ids of all currently added datasets upon successful add", function() {
// 			return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
// 				.then(() => {
// 					return facade.addDataset("courses2", courses, InsightDatasetKind.Sections);
// 				})
// 				.then((insightDataset) => {
// 					expect(insightDataset).to.have.length(2);
// 					expect(insightDataset[0]).to.equal("courses");
// 					expect(insightDataset[1]).to.equal("courses2");
// 				});
// 		});
//
// 		it("should reject add if id contains an underscore", function () {
// 			return facade.addDataset("courses_u", courses, InsightDatasetKind.Sections)
// 				.then((res) => {
// 					throw new InsightError("id contains an underscore");
// 				})
// 				.catch((err) => {
// 					expect(err).to.be.instanceof(InsightError);
// 				});
// 		});
//
// 		it("should reject add if id contains only whitespace characters", function () {
// 			return facade.addDataset("  ", courses, InsightDatasetKind.Sections)
// 				.then((res) => {
// 					throw new InsightError("id contains only whitespace characters");
// 				})
// 				.catch((err) => {
// 					expect(err).to.be.instanceof(InsightError);
// 				});
// 		});
//
// 		it("should reject if id already exists", function () {
// 			return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
// 				.then(() => {
// 					return facade.addDataset("courses",courses, InsightDatasetKind.Sections)
// 						.then((res) => {
// 							throw new InsightError("id already exists");
// 						})
// 						.catch((err) => {
// 							expect(err).to.be.instanceof(InsightError);
// 						});
// 				});
// 		});
//
// 		it("add rooms", function () {
// 			return facade.addDataset("rooms", roomsZip, InsightDatasetKind.Rooms)
// 				.then(() => {
// 					console.log("HI WORK PLZ");
// 				});
// 		});
// 	});

	describe( "Remove Datasets", function () {
		let facade: IInsightFacade;

		beforeEach( function () {
			clearDisk();
			facade = new InsightFacade();
		});

	// 	it("should fulfill with the id of the dataset that was removed", function () {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.removeDataset("courses");
	// 			})
	// 			.then((res) => {
	// 				expect(res).to.deep.equal("courses");
	// 			});
	// 	});

	// 	it("should reject with NotfoundError if valid id not found", function() {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.addDataset("courses2", courses, InsightDatasetKind.Sections);
	// 			})
	// 			.then(() => {
	// 				return facade.removeDataset("courses3");
	// 			})
	// 			.then((res) => {
	// 				throw new NotFoundError("valid id not foumd");
	// 			})
	// 			.catch((err) => {
	// 				expect(err).to.be.instanceof(NotFoundError);
	// 			});
	// 	});

	// 	it("should reject remove with id with underscore", function () {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.removeDataset("courses_u");
	// 			})
	// 			.then((res) => {
	// 				throw new InsightError("id with underscore");
	// 			})
	// 			.catch((err) => {
	// 				expect(err).to.be.instanceof(InsightError);
	// 			});
	// 	});

		it("should reject remove with id with only whitespace characters", function () {
			return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
				.then(() => {
					return facade.removeDataset("  ");
				})
				.then((res) => {
					throw new InsightError("id with only whitespace characters");
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

	// 	it("should remove the id", function() {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.addDataset("courses2", courses, InsightDatasetKind.Sections);
	// 			})
	// 			.then((res) => {
	// 				return facade.removeDataset("courses");
	// 			})
	// 			.then((res) => {
	// 				expect(res).to.deep.equal("courses");
	// 			});
	// 	});
	});

	// describe("Perform Query", async function() {
	// 	let facade: IInsightFacade;
	// 	before (async function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 		await facade.addDataset("rooms", roomsZip, InsightDatasetKind.Rooms)
	// 			.catch((err) => {
	// 				console.log(err);
	// 			});
	// 		await facade.addDataset("sections", courses, InsightDatasetKind.Sections)
	// 			.catch((err) => {
	// 				console.log(err);
	// 			});
	// 	});
	// 	// let facade = new InsightFacade();
	// 	// await facade.addDataset("sections", courses, InsightDatasetKind.Sections)	// this doesnt work for some reason
	// 	// 	.catch((err) => {
	// 	// 		console.log(err);
	// 	// 	});
	//
	// 	folderTest<Input, Output, Error>(
	// 		"dynamic query tests",
	// 		(input: Input): Output => {
	// 			return facade.performQuery(input);
	// 		},
	// 		"./test/resources/queries/",
	// 		{
	// 			errorValidator: (error): error is Error =>
	// 				error === "InsightError" || error === "ResultTooLargeError",
	// 			assertOnError: ((actual, expected) => {
	// 				if (expected === "InsightError") {
	// 					expect(actual).to.be.instanceOf(InsightError);
	// 				} else if (expected === "ResultTooLargeError") {
	// 					expect(actual).to.be.instanceOf(ResultTooLargeError);
	// 				} else {
	// 					expect.fail("UNEXPECTED ERROR");
	// 				}
	// 			})
	// 		}
	// 	);
	// });

	// describe("Custom Perform Query", async function() {
	// 	let facade:  IInsightFacade;
	//
	// 	beforeEach( function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	//
	// 	it("should fulfill with the id of the dataset that was removed", function () {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.removeDataset("courses");
	// 			})
	// 			.then((res) => {
	// 				expect(res).to.deep.equal("courses");
	// 			});
	// 	});
	//
	// 	it("should reject with NotfoundError if valid id not found", function() {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.addDataset("courses2", courses, InsightDatasetKind.Sections);
	// 			})
	// 			.then(() => {
	// 				return facade.removeDataset("courses3");
	// 			})
	// 			.then((res) => {
	// 				throw new NotFoundError("valid id not foumd");
	// 			})
	// 			.catch((err) => {
	// 				expect(err).to.be.instanceof(NotFoundError);
	// 			});
	// 	});
	//
	// 	it("should reject remove with id with underscore", function () {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.removeDataset("courses_u");
	// 			})
	// 			.then((res) => {
	// 				throw new InsightError("id with underscore");
	// 			})
	// 			.catch((err) => {
	// 				expect(err).to.be.instanceof(InsightError);
	// 			});
	// 	});
	//
	// 	it("should reject remove with id with only whitespace characters", function () {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.removeDataset("  ");
	// 			})
	// 			.then((res) => {
	// 				throw new InsightError("id with only whitespace characters");
	// 			})
	// 			.catch((err) => {
	// 				expect(err).to.be.instanceof(InsightError);
	// 			});
	// 	});
	//
	// 	it("should remove the id", function() {
	// 		return facade.addDataset("courses", courses, InsightDatasetKind.Sections)
	// 			.then(() => {
	// 				return facade.addDataset("courses2", courses, InsightDatasetKind.Sections);
	// 			})
	// 			.then((res) => {
	// 				return facade.removeDataset("courses");
	// 			})
	// 			.then((res) => {
	// 				expect(res).to.deep.equal("courses");
	// 			});
	// 	});
	// });

	// describe("Perform Query", async function() {
	// 	let facade: IInsightFacade;
	// 	before (async function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 		await facade.addDataset("sections", courses, InsightDatasetKind.Sections)
	// 			.catch((err) => {
	// 				console.log(err);
	// 			});
	// 	});
	// 	// let facade = new InsightFacade();
	// 	// await facade.addDataset("sections", courses, InsightDatasetKind.Sections)	// this doesnt work for some reason
	// 	// 	.catch((err) => {
	// 	// 		console.log(err);
	// 	// 	});
	//
	// 	folderTest<Input, Output, Error>(
	// 		"dynamic query tests",
	// 		(input: Input): Output => {
	// 			return facade.performQuery(input);
	// 		},
	// 		"./test/resources/queries/",
	// 		{
	// 			errorValidator: (error): error is Error =>
	// 				error === "InsightError" || error === "ResultTooLargeError",
	// 			assertOnError: ((actual, expected) => {
	// 				if (expected === "InsightError") {
	// 					expect(actual).to.be.instanceOf(InsightError);
	// 				} else if (expected === "ResultTooLargeError") {
	// 					expect(actual).to.be.instanceOf(ResultTooLargeError);
	// 				} else {
	// 					expect.fail("UNEXPECTED ERROR");
	// 				}
	// 			})
	// 		}
	// 	);
	// });
	//
	// // describe("Custom Perform Query", async function() {
	// // 	let facade:  IInsightFacade;
	// //
	// // 	beforeEach(function() {
	// // 		clearDisk();
	// // 		facade = new InsightFacade();
	// // 	});
	// //
	// // 	it("should test query", function() {
	// // 		const json: any = {
	// // 			WHERE: {
	// // 				GT: {
	// // 					sections_avg: 90
	// // 				}
	// // 			},
	// // 			OPTIONS: {
	// // 				COLUMNS: [
	// // 					"sections_dept",
	// // 					"sections_avg"
	// // 				],
	// // 				ORDER: "sections_year"
	// // 			}};
	// //
	// // 		return facade.addDataset("sections", courses, InsightDatasetKind.Sections)	// this works for some reason?
	// // 			.then((bruh) => {
	// // 				// console.log(bruh);
	// // 				// console.log(facade.listDatasets());
	// // 				return facade.performQuery(json)
	// // 					.then((output) => {
	// // 						console.log(output);
	// // 						// expect(output).to.deep.equal([{bruh: "frfr"}]);
	// // 						return;
	// // 					});
	// // 			});
	// // 	});
	// // });
});
