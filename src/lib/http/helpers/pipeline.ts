import stream from "stream";
import { pipeline } from "stream/promises";


export default async function asyncPipeline(streams: [stream.Duplex]) {
  await pipeline(streams)

}