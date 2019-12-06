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

export interface ParsedMetadataWSDL {
    complexTypes: ComplexType[];
    simpleTypes: SimpleType[];
}

export interface ComplexType {
    name: string;
    base?: string;
    elements: Element[];
}

export interface SimpleType {
    name: string;
    base?: string;
    enumerations?: string[];
}

export interface Element {
    name: string;
    type: string;
    isArray: boolean;
}

function parseType(type: string): string {
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
            const base: string = parseType(restriction.$.base);
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
                const base: string = parseType(extension.$.base);
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
            result.push({name: el.$.name, type: parseType(el.$.type), isArray});
        } else {
            console.warn(`Sequence element without type: ${JSON.stringify(el, null, 2)}`);
        }
        return result;
    }, []);
}

export function parseTypes(metadataWSDL: MetadataWSDL): ParsedMetadataWSDL {
    const complexTypes: XsdComplexType[] = metadataWSDL.definitions.types[0]["xsd:schema"][0]["xsd:complexType"];
    const simpleTypes: XsdSimpleType[] = metadataWSDL.definitions.types[0]["xsd:schema"][0]["xsd:simpleType"];
    const elements: XsdElement[] = metadataWSDL.definitions.types[0]["xsd:schema"][0]["xsd:element"];
    return [
        parseTypesFromElements(elements),
        parseTypesFromSimpleTypes(simpleTypes),
        parseTypesFromComplexTypes(complexTypes)
    ].reduce((result: ParsedMetadataWSDL, it: ParsedMetadataWSDL) => ({
            complexTypes: result.complexTypes.concat(it.complexTypes),
            simpleTypes: result.simpleTypes.concat(it.simpleTypes)
    }), {complexTypes: [], simpleTypes: []});
}
