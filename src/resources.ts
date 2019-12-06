import fs from "fs-extra";
import path from "path";
import xml2js from "xml2js";
import {MetadataVersion} from "./index";
import {MetadataWSDL} from "./wsdl/wsdl-types";

const parser: xml2js.Parser = new xml2js.Parser();

export function readFile(file: string): Promise<Buffer> {
    return fs.readFile(file);
}

const resourceDir: string = path.join(__dirname, "..", "resources");

export function readMetadataWSDLByVersion(version: MetadataVersion): Promise<MetadataWSDL> {
    return readMetadataWSDLFromPath(path.join(resourceDir, "wsdl", "metadata", `${version}.xml`));
}

export function readMetadataWSDLFromPath(wsdlPath: string): Promise<MetadataWSDL> {
    return readFile(wsdlPath)
        .then((data: Buffer) => parser.parseStringPromise(data));
}
