import { useNavigate } from "react-router-dom";

function AmenityCard({ image, name, description, route, available = true }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 h-full">
      {/* Content */}
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 flex items-center justify-center">
          {typeof image === "string" ? (
            <img src={image} alt={name} className="w-12 h-12 object-contain" />
          ) : (
            image
          )}
        </div>

        <div>
          <h2 className="font-semibold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Action */}
      <button
        disabled={!available}
        onClick={() => navigate(route)}
        className={`mt-auto rounded-xl py-3 w-full text-white font-medium transition
          ${
            available
              ? "bg-[#00704e] hover:bg-[#016446]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
      >
        {available ? "Reserve Now" : "Unavailable"}
      </button>
    </div>
  );
}

export default AmenityCard;
