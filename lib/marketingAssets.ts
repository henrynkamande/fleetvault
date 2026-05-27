import heroImage from '@/assets/6.png'
import exploreImage from '@/assets/1.jpg'
import howItWorksImage from '@/assets/2.jpg'
import joinVisualImage from '@/assets/3.jpg'
import featureImage from '@/assets/4.jpg'

/** Landing page imagery from `frontend/assets/`. */
export const marketingImages = {
  hero: heroImage,
  explore: exploreImage,
  howItWorks: howItWorksImage,
  /** About: teams & trust alongside mission copy */
  aboutMission: joinVisualImage,
  /** About: operations without surveillance narrative */
  aboutVisibility: featureImage,
} as const
