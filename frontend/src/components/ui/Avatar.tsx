interface AvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export function Avatar({ firstName, lastName, photoUrl, size = 'md' }: AvatarProps) {
  const initials = `${(firstName || '?').charAt(0)}${lastName ? (lastName).charAt(0) : ''}`.toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-700`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold ring-2 ring-white dark:ring-gray-700`}
      aria-label={`Avatar de ${firstName} ${lastName}`}
      role="img"
    >
      {initials}
    </div>
  );
}