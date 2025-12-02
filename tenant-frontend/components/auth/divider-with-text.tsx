interface DividerWithTextProps {
  text: string;
}

export function DividerWithText({ text }: DividerWithTextProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white rounded-2xl dark:bg-gray-900 text-gray-500">
          {text}
        </span>
      </div>
    </div>
  );
}