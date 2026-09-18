const campusPhotos: Record<string, string> = {
  'Arizona State University': '/universities/asu.jpg',
  'Nazarbayev University': '/universities/nu.jpg',
  'SDU University': '/universities/sdu.jpg',
  'Delft University of Technology (TU Delft)': '/universities/delft.jpg',
  'University of Oxford': '/universities/oxford.jpg',
  'University of Amsterdam (UvA)': '/universities/uva.jpg',
  'Technical University of Munich (TUM)': '/universities/tum.jpg',
};

export function campusPhoto(university: string): string | undefined {
  return campusPhotos[university];
}
