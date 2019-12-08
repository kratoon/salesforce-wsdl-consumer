/**
 * Type for parsed Metadata WSDL XML.
 *
 * @author Ondřej Kratochvíl
 */
export interface MetadataWSDL {
    definitions: {
        $: {
            targetNamespace: string;
            "xmlns:xsd": string;
            "xmlns": string;
            "xmlns:soap": string;
            "xmlns:tns": string;
        };
        types: Type[];
        message: Message[];
        portType: PortType[];
        binding: Binding[];
        service: Service[];
    };
}

export interface Type {
    "xsd:schema": [{
        $: {
            elementFormDefault: string;
            targetNamespace: string;
        };
        "xsd:complexType": XsdComplexType[];
        "xsd:simpleType": XsdSimpleType[];
        "xsd:element": XsdElement[];
    }];
}

export interface XsdComplexType {
    $?: {
        name: string;
    };
    "xsd:sequence"?: XsdSequence[]; // undefined | 1
    "xsd:complexContent"?: XsdComplexContent[]; // undefined | 1
}

export interface XsdSequence {
    "xsd:element": XsdElement[];
    "xsd:any"?: XsdAny[];
}

export interface XsdSimpleType {
    $: {
        name: string;
    };
    "xsd:restriction": XsdRestriction[]; // 1
}

export interface XsdElement {
    $: {
        name: string;
        type?: string;
        minOccurs?: string;
        maxOccurs?: string;
        nillable?: string;
    };
    "xsd:complexType"?: XsdComplexType[]; // 1
}

export interface XsdAny {
    $: {
        namespace: string;
        minOccurs: string;
        maxOccurs: string;
        processContents: string;
    };
}
export interface XsdExtension {
    $: {
        base: string;
    };
    "xsd:sequence": any[];
}

export interface XsdComplexContent {
    "xsd:extension": XsdExtension[];
}

export interface XsdEnumeration {
    $: {
        value: string;
    };
    "xsd:annotation"?: XsdAnnotation[];
}

export interface XsdAnnotation {
    "xsd:documentation": string[];
}

export interface XsdLength {
    $: {
        value: string;
    };
}

export interface XsdPattern {
    $: {
        value: string;
    };
}

export interface XsdRestriction {
    $: {
        base: string;
    };
    "xsd:enumeration"?: XsdEnumeration[]; // many
    "xsd:length"?: XsdLength[]; // 1
    "xsd:pattern"?: XsdPattern[]; // 1
}

export interface Part {
    $: {
        name: string;
        element: string;
    };
}

export interface Message {
    $: {
        name: string;
    };
    part: Part[];
}

export interface Input {
    $: {
        message: string;
    };
}

export interface Input2 {
    "soap:header": SoapHeader[];
    "soap:body": SoapBody[];
}

export interface Output {
    $: {
        message: string;
    };
}

export interface Operation {
    $: {
        name: string;
    };
    documentation: string[];
    input: Input[];
    output: Output[];
}

export interface Operation2 {
    $: {
        name: string;
    };
    "soap:operation": SoapOperation[];
    input: Input2[];
    output: Output2[];
}

export interface PortType {
    $: {
        name: string;
    };
    operation: Operation[];
}

export interface SoapBinding {
    $: {
        style: string;
        transport: string;
    };
}

export interface SoapOperation {
    $: {
        soapAction: string;
    };
}

export interface SoapHeader {
    $: {
        use: string;
        part: string;
        message: string;
    };
}

export interface SoapBody {
    $: {
        use: string;
        parts: string;
    };
}

export interface SoapBody2 {
    $: {
        use: string;
    };
}

export interface SoapHeader2 {
    $: {
        use: string;
        part: string;
        message: string;
    };
}

export interface Output2 {
    "soap:body": SoapBody2[];
    "soap:header": SoapHeader2[];
}

export interface Binding {
    $: {
        name: string;
        type: string;
    };
    "soap:binding": SoapBinding[];
    operation: Operation2[];
}

export interface SoapAddress {
    $: {
        location: string;
    };
}

export interface Port {
    $: {
        binding: string;
        name: string;
    };
    "soap:address": SoapAddress[];
}

export interface Service {
    $: {
        name: string;
    };
    documentation: string[];
    port: Port[];
}
