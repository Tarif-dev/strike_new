import { useRef, useEffect } from "react";

interface Winner {
  id: number;
  username: string;
  fullName?: string;
  location: string;
  amount: number;
  avatar: string;
}

interface WinnersSliderProps {
  winners: Winner[];
}

export default function WinnersSlider({ winners }: WinnersSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sliderRef.current) {
        // Implementing auto scroll if needed
      }
    };

    // Cleanup function
    return () => {};
  }, [winners]);

  if (winners.length === 0) {
    return (
      <div className="py-3 px-4">
        <h2 className="text-lg font-['Roboto_Condensed'] font-bold mb-3">Recent Winners</h2>
        <div className="bg-white rounded-lg shadow-sm p-3 text-center">
          <p className="text-sm text-gray-500">No recent winners</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-4">
      <h2 className="text-lg font-['Roboto_Condensed'] font-bold mb-3">Recent Winners</h2>
      <div className="overflow-x-auto">
        <div ref={sliderRef} className="flex space-x-4 pb-2">
          {winners.map((winner) => (
            <div key={winner.id} className="bg-white rounded-lg shadow-sm p-3 min-w-[200px]">
              <div className="flex items-center mb-2">
                <img 
                  src={winner.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80"} 
                  className="w-10 h-10 rounded-full mr-2" 
                  alt={`${winner.username} Avatar`} 
                />
                <div>
                  <p className="text-sm font-medium">{winner.fullName || winner.username}</p>
                  <p className="text-xs text-gray-500">{winner.location}</p>
                </div>
              </div>
              <div className="bg-green-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Won</p>
                <p className="text-lg font-bold text-[#28a745]">₹{winner.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
