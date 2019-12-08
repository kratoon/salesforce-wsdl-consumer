/**
 * Metadata versions defined in this project.
 *
 * @author Ondřej Kratochvíl
 */
export type MetadataVersion = "47";

/**
 * The latest Metadata version defined in this project.
 *
 * @author Ondřej Kratochvíl
 */
export const LATEST_METADATA_VERSION: MetadataVersion = "47";

export * from "./wsdl/wsdl-parser";
export * from "./wsdl/wsdl-types";
export * from "./gen/typeScriptGenerator";
export {
    readMetadataWSDLByVersion,
    readMetadataWSDLFromPath
} from "./resources";
