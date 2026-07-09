// Real food photo URLs per dish name.
// NOTE: this previously used source.unsplash.com, which Unsplash shut down —
// every request 404'd and the app always fell back to emoji gradients.
// It now delegates to the verified static photo set in foodPhotos.ts.

import { getFoodPhoto } from './foodPhotos'

export function getFoodImageUrl(dishName: string, _width = 400, _height = 300): string {
  return getFoodPhoto(dishName)
}
