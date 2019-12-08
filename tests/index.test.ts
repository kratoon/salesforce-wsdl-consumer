import {
    generateTypesFromMetadataWSDL,
    LATEST_METADATA_VERSION,
    parseMetadataWSDL,
    readMetadataWSDLByVersion,
    readMetadataWSDLFromPath
} from "../src";

describe("metadata-version", () => {
    it("latest-metadata-version", () => {
        expect(LATEST_METADATA_VERSION).toBe("47");
    });
});

describe("exports", () => {
    it("all", () => {
        expect(typeof readMetadataWSDLByVersion).toBe("function");
        expect(typeof readMetadataWSDLFromPath).toBe("function");
        expect(typeof parseMetadataWSDL).toBe("function");
        expect(typeof generateTypesFromMetadataWSDL).toBe("function");
    });
});
