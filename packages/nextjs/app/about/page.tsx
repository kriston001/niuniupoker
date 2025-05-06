"use client"

import { useGlobalState } from "~~/services/store/store";

export default function MyPage() {
  const gameConfig = useGlobalState(state => state.gameConfig);
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg shadow-xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center gap-2">
          <span className="text-4xl">🂡</span> NiuNiu Game Rules
        </h1>
      </div>

      <div className="space-y-8">
        {/* Section 1: Create & Manage a Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400 border-b pb-2">
            1. Create & Manage a Table
          </h2>
          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              Anyone can create their own NiuNiu game table and become the Owner.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Upon creation, the Owner can set a custom commission rate (max {gameConfig.maxBankerFeePercent}%) and define extra rewards to attract players.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              After creation, the invitation link is available in the Table Info for sharing with others.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              The Owner may choose to join the game or remain as a manager only.
            </p>
          </div>
        </div>

        {/* Section 2: Game Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400 border-b pb-2">
            2. Game Flow
          </h2>
          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              Players can click Join Game to enter, then click Ready to stake the base bet.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Once there are at least 2 players, the Owner can start the game (consumes one Table Card NFT).
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Higher-level Table Cards allow more players.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              More players mean higher commission rewards for the Owner.
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mt-4">
              <h3 className="font-semibold text-lg mb-2 text-purple-500 dark:text-purple-300">Betting Rounds</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Round 1: Betting</li>
                <li>Round 2: Betting</li>
              </ul>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Each round has a timeout. Players who don't act in time are considered to fold.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                If the Owner doesn't progress the game in time, other players can settle the game.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                When choosing Raise, players must stake additional funds—amount is defined by the Owner and displayed in Table Info.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mt-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-600 dark:text-blue-300">After Game Ends</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>The settler gets {gameConfig.liquidatorFeePercent}% of the owner's stake and deposit (if the owner participated in the game).</li>
                <li>All players share the remaining funds equally.</li>
                <li>The owner will lose all their stake and deposit if they participated in the game.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Owner Privileges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400 border-b pb-2">
            3. Owner Privileges
          </h2>
          <div className="space-y-3">
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>May create a group chat for better communication among players.</li>
              <li>Can edit Table Info (only if no players have joined yet, including the Owner).</li>
              <li>Can kick out players who joined but haven't readied up.</li>
              <li>Each round consumes one Table Card NFT.</li>
              <li>Buying Table Level NFTs grants the ability to create more tables.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Hand Rankings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400 border-b pb-2">
            4. Hand Rankings <span className="text-sm font-normal text-gray-500">(from highest to lowest)</span>
          </h2>
          
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Card Values:</p>
            <p className="text-gray-600 dark:text-gray-400">
              J, Q, K are worth 10 points<br />
              A = 1 point; cards 2–10 retain their face value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-md">
              <p className="font-semibold text-purple-700 dark:text-purple-300">Five Flower Niu</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">All five cards are J/Q/K</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-md">
              <p className="font-semibold text-purple-700 dark:text-purple-300">Five Small Niu</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total points of five cards ≤ 10</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-md">
              <p className="font-semibold text-purple-700 dark:text-purple-300">Bomb Niu</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Four cards with the same number</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-md">
              <p className="font-semibold text-purple-700 dark:text-purple-300">NiuNiu</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Three cards form a multiple of 10; remaining two cards also sum to a multiple of 10</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-md">
              <p className="font-semibold text-purple-700 dark:text-purple-300">Niu 9 ~ Niu 1</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Three cards form a multiple of 10; remaining two sum to 9~1 respectively</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-md">
              <p className="font-semibold text-purple-700 dark:text-purple-300">No Niu</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No three cards form a multiple of 10; the player with the highest card wins (K is the highest)</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚧</span>
            <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">Coming Soon</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300">Game Items (Developing...)</p>
        </div>
      </div>
    </div>
  )
}
