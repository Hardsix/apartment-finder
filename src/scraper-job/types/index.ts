import { Except } from "type-fest";
import { Apartment } from "~/apartment/entities/apartment.entity";

type ParsedApartmentData = Except<
  Apartment,
  "id" | "url" | "meta" | "createdAt" | "updatedAt"
>;

type ScraperJobType = "njuskalo" | "index";

export { ParsedApartmentData, ScraperJobType };
