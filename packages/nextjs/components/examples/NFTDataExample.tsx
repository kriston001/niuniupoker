import { useAccount } from "wagmi";
import { useNFTData } from "~~/hooks/my-hooks/useNFTData";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export const NFTDataExample = () => {
  const { address: connectedAddress } = useAccount();

  // 获取合约 ABI
  const { data: roomCardContractData } = useDeployedContractInfo("BBRoomCard");
  const { data: roomLevelContractData } = useDeployedContractInfo("BBRoomLevel");

  // 使用 NFT 数据钩子
  const {
    hasRoomCard,
    roomCards,
    hasRoomLevel,
    roomLevels,
    totalMaxRooms,
    isLoading,
    refreshData,
  } = useNFTData({
    playerAddress: connectedAddress,
    roomCardAbi: roomCardContractData?.abi || [],
    roomLevelAbi: roomLevelContractData?.abi || [],
    refreshInterval: 15000, // 15秒刷新一次
  });

  if (isLoading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">NFT 数据</h2>
      
      <button 
        className="btn btn-primary mb-4"
        onClick={() => refreshData()}
      >
        刷新数据
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 房卡信息 */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">房卡信息</h3>
            
            {hasRoomCard ? (
              <>
                <p className="text-success">拥有 {roomCards.length} 张房卡</p>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>类型</th>
                        <th>最大下注</th>
                        <th>最大玩家</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomCards.map((card, index) => (
                        <tr key={index}>
                          <td>{card.tokenId.toString()}</td>
                          <td>{card.name}</td>
                          <td>{card.maxBetAmount.toString()}</td>
                          <td>{card.maxPlayers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-error">未拥有房卡</p>
            )}
          </div>
        </div>
        
        {/* 房间等级信息 */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">房间等级信息</h3>
            
            {hasRoomLevel ? (
              <>
                <p className="text-success">
                  拥有 {roomLevels.length} 个等级 NFT，可创建最多 {totalMaxRooms.toString()} 个房间
                </p>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>类型</th>
                        <th>最大房间数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomLevels.map((level, index) => (
                        <tr key={index}>
                          <td>{level.tokenId.toString()}</td>
                          <td>{level.name}</td>
                          <td>{level.maxRooms.toString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-error">未拥有房间等级</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
