import client from "../../../api/client";
import { ArrowLeft,Locate,LocateFixedIcon,LocateIcon,LocationEdit,LocationEditIcon,Star, Tent, } from "lucide-react";
import Link from "next/link";
import Slider from "./slider";


export default async function PropertyDetail({ params }) {
  const id = (await params)?.id;

  console.log("PROPERTY ID:", id);

  if (!id) {
    return <div className="p-5">Invalid property id</div>;
  }

  const { data, error } = await client
    .from("properties")
    .select(`
          id,
          title,
          location,
          price_per_night,
          duration,
          property_type,
          property_category,
          property_images (
            image_url,
            is_cover
          )
        `)
    .eq("id", id);

  const property = data?.[0];

  console.log("PROPERTY DATA:", property);
  console.log(property.property_images);
  console.log("SUPABASE ERROR:", error);

if (!property || error) {
    return <div className="p-5">Property not found</div>;
  }

  return <Slider property={property} />; 
}