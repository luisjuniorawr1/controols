import PublicPageScrollController from '../src/components/PublicPageScrollController';

export default function AppTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PublicPageScrollController />
      {children}
    </>
  );
}
