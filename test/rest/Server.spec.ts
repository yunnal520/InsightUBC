import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use, request} from "chai";
import chaiHttp from "chai-http";
import {getContentFromArchives, getContentFromArchivesServer} from "../resources/TestUtil";
import {clearDisk} from "../../TestUtil";

describe("Server", function () {
	let roomsZip: Buffer;
	let courses: Buffer;

	let facade: InsightFacade;
	let server: Server;

	let invalidCourse: Buffer;


	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		roomsZip = getContentFromArchivesServer("rooms.zip");
		courses = getContentFromArchivesServer("pair.zip");
		server.start();
		invalidCourse = getContentFromArchivesServer("invalidSections.zip");

	});

	after(function () {
		server.stop();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		clearDisk();

	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	// // Sample on how to format PUT requests
	it("PUT test for courses dataset", function () {
		try {
			return request("http://localhost:4321")
				.put("/dataset/courses/sections")
				.send(courses)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// console.log("somewhere in try");
					console.log(res.status);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});
	it("PUT test for courses dataset failing invalid ID 1", function () {
		try {
			return request("http://localhost:4321")
				.put("/dataset/invalid_id/sections")
				.send(courses)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// console.log("somewhere in try");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});
	it("PUT test for courses dataset failing invalid file", function () {
		try {
			return request("http://localhost:4321")
				.put("/dataset/invalid_id/sections")
				.send(invalidCourse)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// console.log("somewhere in try");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});

	it("PUT test for courses dataset failing invalid ID 2", function () {
		try {
			return request("http://localhost:4321")
				.put("/dataset/hi bye/sections")
				.send(invalidCourse)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// console.log("somewhere in try");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});

	it("PUT test for courses dataset failing invalid ID 3", function () {
		try {
			return request("http://localhost:4321")
				.put("/dataset/'  '/sections")
				.send(invalidCourse)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// console.log("somewhere in try");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});

	it("PUT test for courses dataset failing invalid ID 4", function () {
		try {
			return request("http://localhost:4321")
				.put("/dataset/invalid_id/sections")
				.send(courses)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					return request("http://localhost:4321")
						.put("/dataset/invalid_id/sections")
						.send(courses)
						.set("Content-Type", "application/x-zip-compressed")
						.then(() => {
							console.log(res.status);
							expect(res.status).to.be.equal(400);
						});
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});

	it("Delete test for courses dataset failing 1", function () {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/invalid_courses")
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});

	it("Delete test for courses dataset failing 2", function () {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/hello")
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(404);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});

	it("Delete test for courses dataset failing 3", function () {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/'   '")
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					console.log("hello catch");
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});
	it("Delete test for courses dataset failing 4", function () {
		try {
			return request("http://localhost:4321")
				.delete("/dataset/hi bye")
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					console.log("hello catch");
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});
	it("POST test for courses dataset 1", function () {
		let queryObject = {hi: "Bye"};
		try {
			return request("http://localhost:4321")
				.post("/query")
				.send(queryObject)
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}

	});
	it("POST test for courses dataset 2", function () {
		try {
			return request("http://localhost:4321")
				.post("/query")
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(400);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});
	it("GET test for courses dataset", function () {
		try {
			return request("http://localhost:4321")
				.get("/datasets")
				.then(function (res: ChaiHttp.Response) {
					// console.log("inside then");
					console.log(res.status);
					expect(res.status).to.be.equal(200);
					// console.log(res.body);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
		}
	});
	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
