import RecapGlob from '../dashboard/recapGlob';

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h2>
      <RecapGlob onResponse={() => {}} />
    </div>
  );
}