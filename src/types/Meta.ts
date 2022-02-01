import { MetadataJson, programs } from "@metaplex/js";

type Meta = {
  data: programs.metadata.MetadataData;
  json: MetadataJson | undefined;
};

export default Meta;
