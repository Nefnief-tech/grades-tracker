'use client';

import React from 'react';
import { normalizeGrade } from '@/utils/gradeProcessor';

/**
 * Component to display grades with better handling of encrypted values
 */
export default function GradesDisplay({ subject }) {
  if (!subject) return null;

  // Make sure grades exists and is an array
  const grades = Array.isArray(subject.grades) ? subject.grades : [];
  
  // Handle empty grades
  if (grades.length === 0) {
    return (
      <div className="text-gray-500 italic px-4 py-2">
        No grades yet
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {grades.map(grade => {
            // Normalize the grade to ensure valid values
            const normalizedGrade = normalizeGrade(grade);
            if (!normalizedGrade) return null;
            
            return (
              <tr key={normalizedGrade.id}>
                <td className="px-4 py-2 whitespace-nowrap">{normalizedGrade.name || '(Unnamed)'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{normalizedGrade.value}</td>
                <td className="px-4 py-2 whitespace-nowrap">{normalizedGrade.weight}x</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {normalizedGrade.date ? new Date(normalizedGrade.date).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="px-4 py-2 font-medium">Average:</td>
            <td className="px-4 py-2 font-medium">{subject.averageGrade}</td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}