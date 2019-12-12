import {
    MetadataWSDL,
    XsdComplexContent,
    XsdComplexType,
    XsdElement,
    XsdEnumeration,
    XsdExtension,
    XsdLength,
    XsdPattern,
    XsdRestriction,
    XsdSequence,
    XsdSimpleType
} from "./wsdl-types";

/**
 * Result of Metadata WSDL parser.
 *
 * @author Ondřej Kratochvíl
 */
export interface ParsedMetadataWSDL {
    complexTypes: ComplexType[];
    simpleTypes: SimpleType[];
}

/**
 * Parsed xsd complex type.
 *
 * @author Ondřej Kratochvíl
 */
export interface ComplexType {
    name: string;
    base?: string;
    elements: Element[];
}

/**
 * Parsed xsd simple type.
 *
 * @author Ondřej Kratochvíl
 */
export interface SimpleType {
    name: string;
    base?: string;
    enumerations?: string[];
}

/**
 * Parsed xsd element.
 *
 * @author Ondřej Kratochvíl
 */
export interface Element {
    name: string;
    type: string;
    isArray: boolean;
    isOptional: boolean;
}

/**
 * Parse Metadata WSDL.
 *
 * @param metadataWSDL - already parsed XML Metadata WSDL.
 *
 * @author Ondřej Kratochvíl
 */
export function parseMetadataWSDL(metadataWSDL: MetadataWSDL): ParsedMetadataWSDL {
    const complexTypes: XsdComplexType[] = metadataWSDL.definitions.types[0]["xsd:schema"][0]["xsd:complexType"];
    const simpleTypes: XsdSimpleType[] = metadataWSDL.definitions.types[0]["xsd:schema"][0]["xsd:simpleType"];
    const elements: XsdElement[] = metadataWSDL.definitions.types[0]["xsd:schema"][0]["xsd:element"];
    console.log(`XSD complex types: ${complexTypes.length}`);
    console.log(`XSD simple types: ${simpleTypes.length}`);
    console.log(`XSD elements: ${elements.length}`);
    const parsed: ParsedMetadataWSDL = [
        parseTypesFromElements(elements),
        parseTypesFromSimpleTypes(simpleTypes),
        parseTypesFromComplexTypes(complexTypes)
    ].reduce((result: ParsedMetadataWSDL, it: ParsedMetadataWSDL) => ({
        complexTypes: result.complexTypes.concat(it.complexTypes),
        simpleTypes: result.simpleTypes.concat(it.simpleTypes)
    }), {complexTypes: [], simpleTypes: []});
    console.log(`Complex types: ${parsed.complexTypes.length}`);
    console.log(`Simple types: ${parsed.simpleTypes.length}`);
    return parsed;
}

function parseStringType(type: string): string {
    if (type.startsWith("xsd:")) {
        return type.substring(4);
    } else if (type.startsWith("tns:")) {
        return type.substring(4);
    }
    throw Error(`Unknown wsdl type ${type}`);
}

function parseTypesFromSimpleTypes(simpleTypes: XsdSimpleType[]): ParsedMetadataWSDL {
    return simpleTypes
        .sort((a: XsdSimpleType, b: XsdSimpleType) => a.$.name.localeCompare(b.$.name))
        .reduce((result: ParsedMetadataWSDL, it: XsdSimpleType) => {
            const name: string = it.$.name;
            const restriction: XsdRestriction = it["xsd:restriction"][0];
            const base: string = parseStringType(restriction.$.base);
            const enumerations: XsdEnumeration[] | undefined = restriction["xsd:enumeration"];
            const length: XsdLength[] | undefined = restriction["xsd:length"];
            const pattern: XsdPattern[] | undefined = restriction["xsd:pattern"];
            if (enumerations) {
                result.simpleTypes.push({name, base, enumerations: enumerations.map(e => e.$.value)});
            } else if (length && pattern) {
                if (base) {
                    result.simpleTypes.push({name, base});
                } else {
                    throw Error(`Unsupported simple type: ${JSON.stringify(it, null, 2)}`);
                }
            } else {
                result.simpleTypes.push({name, base});
            }
            return result;
        }, {complexTypes: [], simpleTypes: []});
}

function parseTypesFromComplexTypes(complexTypes: XsdComplexType[]): ParsedMetadataWSDL {
    return complexTypes
        .sort((a: XsdComplexType, b: XsdComplexType) => a.$ && b.$ ? a.$.name.localeCompare(b.$.name) : 0)
        .reduce((result: ParsedMetadataWSDL, it: XsdComplexType): ParsedMetadataWSDL => {
            if (!it.$) {
                return result;
            }
            const name: string = it.$.name;
            const sequences: XsdSequence[] | undefined = it["xsd:sequence"];
            const complexContents: XsdComplexContent[] | undefined = it["xsd:complexContent"];
            if (sequences) {
                const sequenceElements: XsdElement[] = sequences[0]["xsd:element"];
                if (sequenceElements) {
                    result.complexTypes.push({name, elements: createPropertiesFromSequenceElements(sequenceElements)});
                }
            } else if (complexContents) {
                const extension: XsdExtension = complexContents[0]["xsd:extension"][0];
                const base: string = parseStringType(extension.$.base);
                const extensionSequence: XsdSequence = extension["xsd:sequence"][0];
                const sequenceElements: XsdElement[] = extensionSequence["xsd:element"];
                const elements: Element[] = sequenceElements
                    ? createPropertiesFromSequenceElements(sequenceElements)
                    : [];
                result.complexTypes.push({name, elements, base});
            }
            return result;
        }, {complexTypes: [], simpleTypes: []});
}

function parseTypesFromElements(elements: XsdElement[]): ParsedMetadataWSDL {
    return elements.reduce((result: ParsedMetadataWSDL, el: XsdElement): ParsedMetadataWSDL => {
        if (el["xsd:complexType"] && el["xsd:complexType"][0]["xsd:sequence"]) {
            const sequence: XsdSequence = el["xsd:complexType"][0]["xsd:sequence"][0];
            const sequenceElements: XsdElement[] = sequence["xsd:element"];
            result.complexTypes.push({
                name: el.$.name,
                elements: createPropertiesFromSequenceElements(sequenceElements)
            });
        }
        return result;
    }, {complexTypes: [], simpleTypes: []});
}

function createPropertiesFromSequenceElements(sequenceElements: XsdElement[]): Element[] {
    return sequenceElements.reduce((result: Element[], el: XsdElement): Element[] => {
        if (el.$.type) {
            const isArray: boolean = Boolean(el.$.maxOccurs && el.$.maxOccurs === "unbounded");
            const isOptional: boolean = Boolean(el.$.minOccurs && el.$.minOccurs === "0");
            result.push({name: el.$.name, type: parseStringType(el.$.type), isArray, isOptional});
        } else {
            console.warn(`Sequence element without type: ${JSON.stringify(el, null, 2)}`);
        }
        return result;
    }, []);
}
