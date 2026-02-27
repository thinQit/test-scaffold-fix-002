import Spinner from '@/components/ui/Spinner';

export function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export default Loading;
