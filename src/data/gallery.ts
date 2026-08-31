export type GalleryItem = {
  id: string;
  assetId: string;
  caption: string;
  /** Layout weight inside the editorial grid. */
  span: "wide" | "tall" | "square" | "small";
};

export const galleryItems: GalleryItem[] = [
  { id: "g1", assetId: "golden-retriever", caption: "Golden Retriever · studio", span: "wide" },
  { id: "g2", assetId: "kitten", caption: "Kitten · studio", span: "small" },
  { id: "g3", assetId: "british-shorthair", caption: "British Shorthair · studio", span: "tall" },
  { id: "g4", assetId: "puppy", caption: "Labrador puppy · studio", span: "square" },
  { id: "g5", assetId: "rabbit", caption: "Lop-eared rabbit · studio", span: "small" },
  { id: "g6", assetId: "french-bulldog", caption: "French Bulldog · studio", span: "wide" },
  { id: "g7", assetId: "siamese", caption: "Siamese · studio", span: "square" },
  { id: "g8", assetId: "cockatiel", caption: "Cockatiel · studio", span: "small" },
];
