import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center py-12 w-full">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>
    <p className="text-gray-600 mb-4 text-center">{description}</p>
  </div>
);

export default EmptyState;
