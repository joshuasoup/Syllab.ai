export function addRateMyProfLinks(jsonObject: any): any {
  if (!jsonObject || typeof jsonObject !== 'object') {
    return jsonObject;
  }
  
  const instructors = jsonObject.instructors;
  
  if (Array.isArray(instructors)) {
    instructors.forEach((instructor) => {
      if (instructor && typeof instructor === 'object') {
        if (instructor.name && typeof instructor.name === 'string' && instructor.name.trim() !== '') {
          const name = instructor.name.trim();
          const encodedName = encodeURIComponent(name);
          instructor.ratemyprof = `https://www.ratemyprofessors.com/search/professors?q=${encodedName}`;
        } else {
          instructor.ratemyprof = null;
        }
      }
    });
  }
  
  return jsonObject;
}



