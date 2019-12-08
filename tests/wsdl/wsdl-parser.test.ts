/* tslint:disable:no-non-null-assertion */
import {ComplexType, ParsedMetadataWSDL, parseMetadataWSDL, readMetadataWSDLByVersion, SimpleType} from "../../src";

function getSimpleTypeByName(parsedMetadataWSDL: ParsedMetadataWSDL, name: string): SimpleType | undefined {
    return parsedMetadataWSDL.simpleTypes.find(it => it.name === name);
}

function getComplexTypeByName(parsedMetadataWSDL: ParsedMetadataWSDL, name: string): ComplexType | undefined {
    return parsedMetadataWSDL.complexTypes.find(it => it.name === name);
}

describe("wsdl-parser", () => {
    it("parse-metadata-wsdl-47", () => {
        return readMetadataWSDLByVersion("47")
            .then(parseMetadataWSDL)
            .then((parsed: ParsedMetadataWSDL) => {
                expect(parsed.complexTypes.length).toBe(873);
                expect(parsed.simpleTypes.length).toBe(291);

                const metadata: ComplexType = getComplexTypeByName(parsed, "Metadata")!;
                expect(metadata.base).toBe(undefined);
                expect(metadata.elements.length).toBe(1);
                expect(metadata.elements[0].name).toBe("fullName");
                expect(metadata.elements[0].type).toBe("string");
                expect(metadata.elements[0].isArray).toBe(false);

                const apexClass: ComplexType = getComplexTypeByName(parsed, "ApexClass")!;
                expect(apexClass.base).toBe("MetadataWithContent");
                expect(apexClass.elements.length).toBe(3);
                expect(apexClass.elements[0].name).toBe("apiVersion");
                expect(apexClass.elements[0].type).toBe("double");
                expect(apexClass.elements[0].isArray).toBe(false);

                const matchingRules: ComplexType = getComplexTypeByName(parsed, "MatchingRules")!;
                expect(matchingRules.base).toBe("Metadata");
                expect(matchingRules.elements.length).toBe(1);
                expect(matchingRules.elements[0].name).toBe("matchingRules");
                expect(matchingRules.elements[0].type).toBe("MatchingRule");
                expect(matchingRules.elements[0].isArray).toBe(true);

                const allOrNoneHeader: ComplexType = getComplexTypeByName(parsed, "AllOrNoneHeader")!;
                expect(allOrNoneHeader.elements.length).toBe(1);
                expect(allOrNoneHeader.elements[0].name).toBe("allOrNone");
                expect(allOrNoneHeader.elements[0].type).toBe("boolean");
                expect(allOrNoneHeader.elements[0].isArray).toBe(false);

                const accountRelationshipShareRule: ComplexType = getComplexTypeByName(parsed, "AccountRelationshipShareRule")!;
                expect(accountRelationshipShareRule.base).toBe("Metadata");
                expect(accountRelationshipShareRule.elements.length).toBe(7);
                expect(accountRelationshipShareRule.elements[0].name).toBe("accessLevel");
                expect(accountRelationshipShareRule.elements[0].isArray).toBe(false);
                expect(accountRelationshipShareRule.elements[0].isOptional).toBe(false);
                expect(accountRelationshipShareRule.elements[2].name).toBe("description");
                expect(accountRelationshipShareRule.elements[2].isArray).toBe(false);
                expect(accountRelationshipShareRule.elements[2].isOptional).toBe(true);

                const extendedErrorCode: SimpleType = getSimpleTypeByName(parsed, "ExtendedErrorCode")!;
                expect(extendedErrorCode.enumerations!.length).toBe(340);
                expect(extendedErrorCode.enumerations!.includes("ACTIONCALL_DUPLICATE_INPUT_PARAM")).toBe(true);

                const id: SimpleType = getSimpleTypeByName(parsed, "ID")!;
                expect(id.enumerations).toBe(undefined);
                expect(id.base).toBe("string");

                const dashboardComponentColumnType: SimpleType = getSimpleTypeByName(parsed, "DashboardComponentColumnType")!;
                expect(dashboardComponentColumnType.enumerations).toBe(undefined);
                expect(dashboardComponentColumnType.base).toBe("string");
            });
    });
});
