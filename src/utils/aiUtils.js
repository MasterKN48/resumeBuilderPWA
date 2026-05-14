/**
 * Minifies resume data for efficient AI prompt usage.
 * Removes IDs and redundant structural elements to save tokens.
 */
export function minifyResumeData(data) {
  if (!data) return "";

  const minified = {
    personal: {
      name: data.name,
      title: data.profession,
      summary: data.summary,
    },
    exp: data.experience?.map(e => ({
      role: e.title,
      co: e.company,
      tasks: e.bullets
    })),
    edu: data.education?.map(e => ({
      deg: e.degree,
      inst: e.institution
    })),
    skills: data.skills?.map(s => s.name),
    projects: data.projects?.map(p => ({
      n: p.name,
      d: p.description
    }))
  };

  return JSON.stringify(minified);
}
