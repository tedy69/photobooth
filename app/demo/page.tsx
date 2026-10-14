import PhotoBooth from "@/components/photo-booth";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Sample photo studio" };
export default function Demo() {
  return <PhotoBooth demo />;
}
