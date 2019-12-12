import fs from "fs-extra";
import {ComplexType, Element, MetadataWSDL, ParsedMetadataWSDL, parseMetadataWSDL, SimpleType} from "..";
import {LATEST_METADATA_VERSION, MetadataVersion} from "../index";
import {readMetadataWSDLByVersion, readMetadataWSDLFromPath} from "../resources";

/**
 * @property outputFile - output file for generated types.
 * @property latest - use the latest Metadata WSDL defined in this project.
 * @property metadataVersion - use specific Metadata WSDL by a version defined in this project.
 * @property metadataWsdlPath - use specific Metadata WSDL.
 *
 * @author  Ondřej Kratochvíl
 */
export interface MetadataTypeScriptGenOptions {
    readonly outputFile?: string;
    readonly latest?: boolean;
    readonly metadataVersion?: MetadataVersion;
    readonly metadataWsdlPath?: string;
}

/**
 * Generate TypeScript types from Metadata WSDL.
 * See [example result]{@link https://github.com/kratoon3/salesforce-metadata/blob/master/src/metadata-types.ts}.
 *
 * @param options - Set latest or metadataVersion if you want to use this project's WSDL.
 * If latest is set, metadataVersion and metadataWsdlPath are ignored.
 * If metadataVersion is set, metadataWsdlPath is ignored.
 * You can override default 'metadata-types.ts' output file with outputFile.
 *
 * @author  Ondřej Kratochvíl
 */
export function generateTypesFromMetadataWSDL(
    options: MetadataTypeScriptGenOptions = {
        outputFile: "metadata-types.ts",
        latest: true
    }
): Promise<void> {
    function getMetadataWSDL(): Promise<MetadataWSDL> {
        if (options.latest) {
            return readMetadataWSDLByVersion(LATEST_METADATA_VERSION);
        } else if (options.metadataVersion) {
            return readMetadataWSDLByVersion(options.metadataVersion);
        } else if (options.metadataWsdlPath) {
            return readMetadataWSDLFromPath(options.metadataWsdlPath);
        }
        return readMetadataWSDLByVersion(LATEST_METADATA_VERSION);
    }
    const outputFile: string = options.outputFile || "metadata-types.ts";
    fs.ensureFileSync(outputFile);
    return getMetadataWSDL()
        .then((wsdl: MetadataWSDL) => fs.writeFile(outputFile, buildScript(parseMetadataWSDL(wsdl))));
}

function firstLetterToUpperCase(str: string): string {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function getType(element: Element): string {
    const mapping: { [xsdType: string]: string } = {
        int: "number",
        boolean: "boolean",
        string: "string",
        double: "number",
        long: "number",
        date: "string",
        dateTime: "string",
        time: "number",
        base64Binary: "any",
        anyType: "any"
    };
    if (mapping[element.type]) {
        return mapping[element.type];
    }
    return element.type;
}

function getTypeAlwaysArray(element: Element): string | null {
    const type: string = getType(element);
    return type && !type.includes("[]") ? `${type}[]` : type;
}

function buildInterface(type: ComplexType): string {
    const extend: string = type.base ? ` extends ${type.base}` : "";
    let result: string = `export interface ${firstLetterToUpperCase(type.name)}${extend} {\n`;
    for (const property of type.elements || []) {
        const propertyType: string | null = getTypeAlwaysArray(property);
        if (!propertyType) {
            throw Error(`Unknown property type [${propertyType}]`);
        }
        result += `    ${property.name}?: ${propertyType};\n`;
    }
    result += "}\n";
    return result;
}

function buildType(type: SimpleType): string {
    if (type.enumerations) {
        return `export type ${type.name} = ${type.enumerations.map(it => `"${it}"`).join(" | ")};\n`;
    } else if (type.base) {
        return `export type ${type.name} = ${type.base};\n`;
    }
    throw new Error("Unknown simple type without enumerations and/or base.");
}

function buildMetadataType(metadataTypes: ComplexType[]): string {
    return `export type MetadataType = \n${metadataTypes.map(it => `\t"${it.name}"`).join(" |\n")};\n`;
}

function buildMetadataTypeArray(metadataTypes: ComplexType[]): string {
    return `export const metadataTypes: MetadataType[] = [\n${metadataTypes.map(it => `\t"${it.name}",`).join("\n")}\n];\n`;
}

function filterMetadataTypes(complexTypes: ComplexType[]): ComplexType[] {
    const nameToIsMetadata: { [name: string]: boolean } = mapComplexTypeNameToIsMetadata(complexTypes);
    return complexTypes.filter(it => nameToIsMetadata[it.name]);
}

function mapComplexTypeNameToIsMetadata(complexTypes: ComplexType[]): { [name: string]: boolean } {
    const result: { [name: string]: boolean } = {Metadata: true};
    let found: number = 1;
    while (found !== complexTypes.length) {
        for (const it of complexTypes) {
            if (result[it.name] === undefined) {
                if (!it.base || (it.base && result[it.base] === false)) {
                    result[it.name] = false;
                    ++found;
                } else if (it.base && result[it.base]) {
                    result[it.name] = true;
                    ++found;
                }
            }

        }
    }
    return result;
}

function buildScript(parsedMetadataWSDL: ParsedMetadataWSDL): string {
    const tslintDisabled: string = "/* tslint:disable */\n";
    const notice: string = `/* This file was created via "salesforce-wsdl-consumer".
Do not make any changes here as it can be anytime regenerated. 
Project: https://github.com/kratoon3/salesforce-wsdl-consumer
Issues: https://github.com/kratoon3/salesforce-wsdl-consumer/issues */

`;
    const typeScriptTypes: string[] = parsedMetadataWSDL.simpleTypes.map(buildType);
    const typeScriptInterfaces: string[] = parsedMetadataWSDL.complexTypes.map(buildInterface);
    const metadataTypes: ComplexType[] = filterMetadataTypes(parsedMetadataWSDL.complexTypes);
    console.log("Metadata types: ", metadataTypes.length);
    return [
        tslintDisabled,
        notice,
        typeScriptTypes.join(""),
        typeScriptInterfaces.join("\n"),
        buildMetadataType(metadataTypes),
        buildMetadataTypeArray(metadataTypes)
    ].join("\n");
}
