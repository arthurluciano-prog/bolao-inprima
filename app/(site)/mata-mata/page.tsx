export default function MataMataPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-[28px] text-primary">Mata-Mata</h1>
        <p className="text-sm text-gray-500">Chaveamento da fase eliminatória</p>
      </div>
      <div className="rounded-card border border-dashed border-gray-300 bg-white p-10 text-center">
        <i className="ti ti-tournament mb-3 block text-gray-300" style={{ fontSize: '44px' }} />
        <p className="text-sm font-medium text-gray-500">Chaveamento em breve</p>
        <p className="text-xs text-gray-400">
          Disponível após confirmação oficial do chaveamento pela FIFA
        </p>
      </div>
    </div>
  );
}
