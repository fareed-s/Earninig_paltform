import { HiCheck, HiStar, HiLightningBolt } from 'react-icons/hi';

const PackageCard = ({ pkg, currentPackage, onBuy, recommended }) => {
  const isActive = currentPackage === pkg.slug;

  return (
    <div className={`card relative overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col
      ${recommended ? 'border-2 border-primary-500 ring-4 ring-primary-100' : ''}
      ${isActive ? 'border-2 border-green-500 ring-4 ring-green-100' : ''}`}>

      {recommended && !isActive && (
        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
          POPULAR
        </div>
      )}

      {isActive && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <HiCheck className="w-3 h-3" /> ACTIVE
        </div>
      )}

      <div className="text-center mb-4">
        <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3
          ${pkg.slug === 'starter' ? 'bg-blue-100' : pkg.slug === 'standard' ? 'bg-purple-100' : 'bg-amber-100'}`}>
          {pkg.slug === 'pro' ? <HiLightningBolt className="w-7 h-7 text-amber-600" /> : <HiStar className="w-7 h-7 text-primary-600" />}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-extrabold text-slate-800">Rs {pkg.price}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <HiCheck className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-slate-600">{pkg.earningMultiplier}x Earning Multiplier</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <HiCheck className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-slate-600">{pkg.dailyTaskLimit >= 999 ? 'Unlimited' : pkg.dailyTaskLimit} Daily Tasks</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <HiCheck className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-slate-600">{pkg.referralCommissionPercent}% Referral Commission</span>
        </div>
      </div>

      {isActive ? (
        <button disabled className="w-full py-3 rounded-xl bg-green-50 text-green-600 font-semibold">
          Currently Active
        </button>
      ) : (
        <button onClick={() => onBuy(pkg)} className={`w-full py-3 rounded-xl font-semibold transition-all duration-200
          ${recommended ? 'btn-primary' : 'btn-outline'}`}>
          Buy Now
        </button>
      )}
    </div>
  );
};

export default PackageCard;
