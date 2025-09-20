import { CollectForm } from "@/types/collectForm.types";
import React from "react";
import CollectFormCard from "./CollectFormCard";
import LoadingCover from "../layout/LoadingCover";

interface Props {
  items: CollectForm[] | null;
  loading: boolean;
  error: string | null;
}

const CollectFormsList = ({ items, loading, error }: Props) => {
  return (
    <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(150px,_320px))] gap-8 justify-between relative flex-1">
      {loading && <LoadingCover />}
      {items &&
        items.map((item) => <CollectFormCard key={item._id} data={item} />)}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CollectFormsList;
