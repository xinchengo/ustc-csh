"use client";

import { useEffect, useState } from 'react';

interface Course {
  id: number;
  cn: string;
  en: string;
  code: string;
  period: number;
  credits: number;
}

interface Substitution {
  id: number;
  substituteCourses: Course[];
  originalCourses: Course[];
}

export default function Home() {
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);

  useEffect(() => {
    fetch('/list.json')
      .then((response) => response.json())
      .then((data) => setSubstitutions(data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Substitutions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {substitutions.map((substitution) => (
          <div key={substitution.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Substitution #{substitution.id}</h2>
            <div>
              <h3 className="font-medium">Original Courses:</h3>
              <ul className="list-disc list-inside">
                {substitution.originalCourses.map((course) => (
                  <li key={course.id}>
                    {course.cn} ({course.en}) - {course.code}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <h3 className="font-medium">Substitute Courses:</h3>
              <ul className="list-disc list-inside">
                {substitution.substituteCourses.map((course) => (
                  <li key={course.id}>
                    {course.cn} ({course.en}) - {course.code}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}