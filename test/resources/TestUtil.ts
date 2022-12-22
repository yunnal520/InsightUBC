import * as fs from "fs-extra";

const persistDir = "./data";

const getContentFromArchives =  (name: string) =>
	fs.readFileSync(`test/resources/archives/${name}`).toString("base64");

function clearDisk(): void {
	fs.removeSync(persistDir);
}

const getContentFromArchivesServer =  (name: string) =>
	fs.readFileSync(`test/resources/archives/${name}`);

export {getContentFromArchives, getContentFromArchivesServer, persistDir, clearDisk};
