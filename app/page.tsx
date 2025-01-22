"use client";

import { useEffect, useState } from "react";

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
  interchangeable: boolean;
}

function mergeInterchangeable(substitution: Substitution[]): Substitution[] {
  // If there exist two substitution rules
  // A -> B and B -> A
  // Merge them into a single interchangeable rule
  const substitutionMap = new Map<string, Substitution>();
  
  for(const sub of substitution) {
    // Sort the course IDs to create a unique key
    const keyOriginal = sub.originalCourses.map((course) => course.id).sort().join(",");
    const keySubstitute = sub.substituteCourses.map((course) => course.id).sort().join(",");
    let key: string;
    if(keyOriginal < keySubstitute) {
      key = keyOriginal + "," + keySubstitute;
    } else { 
      key = keySubstitute + "," + keyOriginal;
    }
    // If the key already exists, mark it as interchangeable
    if(substitutionMap.has(key)) {
      const existing = substitutionMap.get(key)!;
      existing.interchangeable = true;
    } else {
      substitutionMap.set(key, sub);
    }
  }

  return Array.from(substitutionMap.values());
}

function Course({ course }: { course: Course }) {
  return (
    // a box with sky blue background
    <div className="border rounded shadow bg-sky-100 p-2 min-w-fit">
      <p className="text-md text-center font-light text-black">
        {course.code}
      </p>
      <p className="text-xl text-center font-bold text-blue-900">
        {course.cn}
      </p>
      {/* div with left right layout */}
      <div className="grid grid-flow-col justify-center gap-2">
        <div className="border rounded-full shadow bg-gray-100">
          <p className="text-md text-bold text-center font-bold px-2">
            {course.credits}
          </p>
        </div>
        <div className="text-md text-center font-bold border rounded-full shadow bg-gray-100">
          <p className="text-md text-bold text-center font-bold px-2">
            {course.period}
          </p>
        </div>
      </div>
    </div>
  );
}

function Substitution({ substitution }: { substitution: Substitution }) {
  return (
    <div key={substitution.id} className="border p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">
        Substitution #{substitution.id}
      </h2>
      <div>
        <h3 className="font-medium">Original Courses:</h3>
        <ul className="list-disc list-inside">
          {substitution.originalCourses.map((course) => (
            <Course key={course.id} course={course} />
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <h3 className="font-medium">Substitute Courses:</h3>
        <ul className="list-disc list-inside">
          {substitution.substituteCourses.map((course) => (
            <Course key={course.id} course={course} />
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <h3 className="font-medium">
          Interchangeable: {substitution.interchangeable ? "Yes" : "No"}
        </h3>
      </div>
    </div>
  );
}

export default function Home() {
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);

  // Fetch the list of substitutions from the server
  useEffect(() => {
    fetch("/list.json")
      // Parse the response as JSON
      .then((response) => response.json())
      // Merge interchangeable substitutions
      .then((rawData) => mergeInterchangeable(rawData))
      .then((data) => setSubstitutions(data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Substitutions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {substitutions && substitutions.length > 0 ? (
          // Render the list of substitutions
          substitutions.map((substitution) => (
            <Substitution key={substitution.id} substitution={substitution} />
          ))
        ) : (
          // Show a message if no substitutions are available
          <p>No substitutions available.</p>
        )}
      </div>
    </div>
  );
}
