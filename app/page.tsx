"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon, ArrowPathIcon, ArrowDownRightIcon, ClockIcon, TrophyIcon } from "@heroicons/react/24/solid";

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

  for (const sub of substitution) {
    // Sort the course IDs to create a unique key
    const keyOriginal = sub.originalCourses
      .map((course) => course.id)
      .sort()
      .join(",");
    const keySubstitute = sub.substituteCourses
      .map((course) => course.id)
      .sort()
      .join(",");
    let key: string;
    if (keyOriginal < keySubstitute) {
      key = keyOriginal + "," + keySubstitute;
    } else {
      key = keySubstitute + "," + keyOriginal;
    }
    // If the key already exists, mark it as interchangeable
    if (substitutionMap.has(key)) {
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
    <div className="rounded shadow bg-sky-100 dark:bg-sky-900 p-2 min-w-40">
      <p className="text-md text-center font-light text-black dark:text-white">{course.code}</p>
      <p className="text-xl text-center font-bold text-nowrap text-blue-900 dark:text-blue-200">
        {course.cn}
      </p>
      {/* div with left right layout */}
      <div className="flex justify-center gap-2">
        <div className="flex items-center rounded-full shadow bg-gray-100 dark:bg-gray-500 px-2 gap-1">
          <TrophyIcon className="h-3 w-3 text-gray-500" />
          <p className="text-sm text-bold text-center text-gray-500 dark:text-white font-bold">
            {course.credits}
          </p>
        </div>
        <div className="flex items-center rounded-full shadow bg-gray-100 dark:bg-gray-500 px-2 gap-1">
          <ClockIcon className="h-3 w-3 text-gray-500" />
          <p className="text-sm text-bold text-center text-gray-500 dark:text-white font-bold">
            {course.period}
          </p>
        </div>
      </div>
    </div>
  );
}

function CourseGroup({ courses }: { courses: Course[] }) {
  return (
    <div className="flex items-center">
      {courses.map((course, index) => (
        <div key={course.id} className="flex items-center">
          <Course course={course} />
          {index < courses.length - 1 && (
            <PlusIcon className="h-4 w-4 rounded-full shadow bg-white dark:bg-gray-500 text-gray-500 dark:text-white -ml-2 -mr-2 z-10" />
          )}
        </div>
      ))}
    </div>
  );
}


function Substitution({ substitution }: { substitution: Substitution }) {
  if (substitution.interchangeable) {
    // If the substitution is interchangeable, draw a bidirectional arrow
    return (
      <div className="flex items-center">
        <CourseGroup courses={substitution.substituteCourses} />
        <ArrowPathIcon className="h-5 w-5 rounded-full bg-green-500 dark:bg-green-600 text-white p-0.5 -ml-2 -mr-2 z-10" />
        <CourseGroup courses={substitution.originalCourses} />
      </div>
    );
  }
  else {
    // If the substitution is not interchangeable, draw a unidirectional arrow
    return (
      <div className="flex items-center">
        <CourseGroup courses={substitution.substituteCourses} />
        <ArrowDownRightIcon className="h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-600 text-white p-0.5 -ml-2 -mr-2 z-10" />
        {/* The original courses are displayed in grayscale */}
        <span className="origin-left scale-90 translate-y-3 -translate-x-3 -z-10 grayscale">
          <CourseGroup courses={substitution.originalCourses} />
        </span>
      </div>
    );
  }
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
      <h1 className="text-2xl font-bold mb-4">课程替代关系</h1>
      <div className="flex flex-wrap gap-10">
        {substitutions.map((substitution) => (
          <Substitution key={substitution.id} substitution={substitution} />
        ))}
      </div>
    </div>
  );
}
