# salesforce-wsdl-consumer

[![npm version](https://badge.fury.io/js/salesforce-wsdl-consumer.svg)](https://badge.fury.io/js/salesforce-wsdl-consumer)

Simple Force.com Metadata WSDL parser and types generator.

WARNING: this project is not stable yet and any API can change.

The result of the parser is an object containing ComplexTypes and SimpleTypes.
On top of this parser is built a types generator. 
You can see the resulting
[types](https://github.com/kratoon3/salesforce-metadata/blob/master/src/metadata-types.ts)
in another project.

If you need already generated types
or read/write metadata files,
you can use this
[project](https://github.com/kratoon3/salesforce-metadata)
published to npm instead.

## Generator Example
```typescript
generateTypesFromMetadataWSDL({
    outputFile: "types.ts",
    metadataVersion: "47"
});
```
You can also import the LATEST_METADATA_VERSION constant.

## Parser Example
To read MetadataWSDL, you have two options,
`readMetadataWSDLByVersion` and `readMetadataWSDLFromPath`.
Then parse types using `parseTypes` function.
```typescript
readMetadataWSDLByVersion("47")
    .then(parseTypes)
    .then(({complexTypes, simpleTypes}: ParsedMetadataWSDL) => {});
```
