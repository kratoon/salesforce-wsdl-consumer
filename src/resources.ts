import fs from "fs-extra";
import path from "path";
import xml2js from "xml2js";
import {MetadataVersion} from "./index";
import {MetadataWSDL} from "./wsdl/wsdl-types";

const parser: xml2js.Parser = new xml2js.Parser();

function readFile(file: string): Promise<Buffer> {
    return fs.readFile(file);
}

const resourceDir: string = path.join(__dirname, "..", "resources");

/**
 * Read Metadata WSDL.
 *
 * @author Ondřej Kratochvíl
 */
export function readMetadataWSDLByVersion(version: MetadataVersion): Promise<MetadataWSDL> {
    return readMetadataWSDLFromPath(path.join(resourceDir, "wsdl", "metadata", `${version}.xml`));
}

/**
 * Read Metadata WSDL.
 *
 * @param wsdlPath - path to your Metadata WSDL.
 *
 * @author Ondřej Kratochvíl
 */
export function readMetadataWSDLFromPath(wsdlPath: string): Promise<MetadataWSDL> {
    return readFile(wsdlPath)
        .then((data: Buffer) => parser.parseStringPromise(data));
}
