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
import Section from "./Section";
import {Content} from "./Content";

export default class Dataset {
	public dataset: InsightDataset;
	public content: Content[];
	constructor(dataset: InsightDataset, content: Content[]) {
		this.dataset = dataset;
		this.content = content;

	}
}
