const { useState, useEffect } = React;

// 本地存储键名
const WARDROBE_STORAGE_KEY = 'my-wardrobe-data';

const WardrobeApp = () => {
  // 默认衣橱数据
  const defaultWardrobe = {
    innerWear: ['吊带', '白吊带', '黑吊带', '灰吊带'],
    shortSleeve: ['茵曼白圆领', '白U领', '黑白条纹', '灰色'],
    shirt: ['乐町白', '克莱因蓝', '蓝格子', '亮蓝纱'],
    pants: ['军绿工装', '薄皮牛仔裤', '森马米白', '逸阳长腿直筒蓝牛仔']
  };

  // 状态管理
  const [wardrobe, setWardrobe] = useState(defaultWardrobe);
  const [outfits, setOutfits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('outfits'); // 'outfits', 'edit'
  const [filters, setFilters] = useState({ top: 'all', bottom: 'all' });
  const [editCategory, setEditCategory] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [itemToRemove, setItemToRemove] = useState({ category: '', item: '' });

  const outfitsPerPage = 5;

  // 从本地存储加载数据
  useEffect(() => {
    const savedData = localStorage.getItem(WARDROBE_STORAGE_KEY);
    if (savedData) {
      try {
        const savedWardrobe = JSON.parse(savedData);
        if (savedWardrobe) setWardrobe(savedWardrobe);
      } catch (e) {
        console.error('Failed to load wardrobe data:', e);
      }
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(wardrobe));
    // 重新生成搭配
    generateOutfits();
  }, [wardrobe]);

  // 生成所有可行的搭配组合
  const generateOutfits = () => {
    const allOutfits = [];
    
    // 情况1: 短袖 + 裤子
    wardrobe.shortSleeve.forEach(top => {
      wardrobe.pants.forEach(bottom => {
        allOutfits.push({
          top: { type: 'shortSleeve', item: top },
          bottom: bottom
        });
      });
    });
    
    // 情况2: 衬衫 + 内搭 + 裤子
    wardrobe.shirt.forEach(shirt => {
      wardrobe.innerWear.forEach(inner => {
        wardrobe.pants.forEach(bottom => {
          allOutfits.push({
            top: { type: 'shirt', item: shirt, inner: inner },
            bottom: bottom
          });
        });
      });
    });
    
    setOutfits(allOutfits);
  };

  // 过滤搭配
  const filteredOutfits = outfits.filter(outfit => {
    if (filters.top !== 'all') {
      if (filters.top.startsWith('shortSleeve-')) {
        const item = filters.top.replace('shortSleeve-', '');
        if (outfit.top.type !== 'shortSleeve' || outfit.top.item !== item) return false;
      } else if (filters.top.startsWith('shirt-')) {
        const item = filters.top.replace('shirt-', '');
        if (outfit.top.type !== 'shirt' || outfit.top.item !== item) return false;
      } else if (filters.top.startsWith('inner-')) {
        const item = filters.top.replace('inner-', '');
        if (outfit.top.type !== 'shirt' || outfit.top.inner !== item) return false;
      }
    }
    
    if (filters.bottom !== 'all' && outfit.bottom !== filters.bottom) {
      return false;
    }
    
    return true;
  });

  // 分页数据
  const indexOfLastOutfit = currentPage * outfitsPerPage;
  const indexOfFirstOutfit = indexOfLastOutfit - outfitsPerPage;
  const currentOutfits = filteredOutfits.slice(indexOfFirstOutfit, indexOfLastOutfit);
  const totalPages = Math.ceil(filteredOutfits.length / outfitsPerPage);

  // 新增衣物项目
  const addItem = (category) => {
    if (!newItemName.trim()) return;
    
    setWardrobe(prev => ({
      ...prev,
      [category]: [...prev[category], newItemName.trim()]
    }));
    
    setNewItemName('');
    setEditCategory(null);
  };

  // 移除衣物项目
  const removeItem = (category, item) => {
    setItemToRemove({ category, item });
  };

  // 确认移除
  const confirmRemove = () => {
    const { category, item } = itemToRemove;
    
    setWardrobe(prev => ({
      ...prev,
      [category]: prev[category].filter(i => i !== item)
    }));
    
    setItemToRemove({ category: '', item: '' });
  };

  // 获取分类名称
  const getCategoryName = (category) => {
    const nameMap = {
      innerWear: '内搭',
      shortSleeve: '短袖',
      shirt: '衬衫',
      pants: '裤子'
    };
    return nameMap[category] || category;
  };

  // 渲染编辑分类界面
  const renderEditCategory = () => {
    if (!editCategory) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
        <div className="bg-white rounded-lg p-4 w-full max-w-md">
          <h3 className="font-bold text-lg mb-4">编辑{getCategoryName(editCategory)}</h3>
          
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`添加新的${getCategoryName(editCategory)}`}
                className="flex-1 p-2 border rounded"
              />
              <button 
                onClick={() => addItem(editCategory)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                添加
              </button>
            </div>
          </div>
          
          <div className="mb-4 max-h-60 overflow-auto">
            <h4 className="font-medium mb-2">现有项目：</h4>
            <div className="space-y-2">
              {wardrobe[editCategory].map(item => (
                <div key={item} className="flex justify-between items-center p-2 border rounded">
                  <span>{item}</span>
                  <button 
                    onClick={() => removeItem(editCategory, item)}
                    className="text-red-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={() => setEditCategory(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 确认删除弹窗
  const renderConfirmRemove = () => {
    if (!itemToRemove.item) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
        <div className="bg-white rounded-lg p-4 w-full max-w-md">
          <h3 className="font-bold text-lg mb-4">确认删除</h3>
          <p className="mb-4">您确定要删除"{itemToRemove.item}"吗？</p>
          
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setItemToRemove({ category: '', item: '' })}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              取消
            </button>
            <button 
              onClick={confirmRemove}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold text-center">我的电子衣橱</h1>
      </header>
      
      {/* 标签页切换 */}
      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 ${activeTab === 'outfits' ? 'bg-white text-blue-500 border-b-2 border-blue-500' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('outfits')}
        >
          搭配查看
        </button>
        <button 
          className={`flex-1 py-3 ${activeTab === 'edit' ? 'bg-white text-blue-500 border-b-2 border-blue-500' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('edit')}
        >
          衣物管理
        </button>
      </div>
      
      {activeTab === 'outfits' ? (
        <div className="p-4">
          {/* 筛选区域 */}
          <div className="mb-4">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">上衣筛选:</label>
              <select 
                className="w-full p-2 border rounded"
                value={filters.top}
                onChange={(e) => setFilters({...filters, top: e.target.value})}
              >
                <option value="all">全部上衣</option>
                <optgroup label="短袖">
                  {wardrobe.shortSleeve.map(item => (
                    <option key={`shortSleeve-${item}`} value={`shortSleeve-${item}`}>{item}</option>
                  ))}
                </optgroup>
                <optgroup label="衬衫">
                  {wardrobe.shirt.map(item => (
                    <option key={`shirt-${item}`} value={`shirt-${item}`}>{item}</option>
                  ))}
                </optgroup>
                <optgroup label="内搭">
                  {wardrobe.innerWear.map(item => (
                    <option key={`inner-${item}`} value={`inner-${item}`}>{item}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">裤子筛选:</label>
              <select 
                className="w-full p-2 border rounded"
                value={filters.bottom}
                onChange={(e) => setFilters({...filters, bottom: e.target.value})}
              >
                <option value="all">全部裤子</option>
                {wardrobe.pants.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 搭配结果 */}
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">
              搭配结果 ({filteredOutfits.length}个)
            </h2>
            
            {filteredOutfits.length === 0 ? (
              <p className="text-center py-4 bg-gray-50 rounded">没有找到符合条件的搭配</p>
            ) : (
              <div className="space-y-3">
                {currentOutfits.map((outfit, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                    <h3 className="font-medium text-sm text-gray-500 mb-1">
                      搭配 #{indexOfFirstOutfit + index + 1}
                    </h3>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="mb-1">
                          <span className="text-gray-600">上衣:</span>{' '}
                          {outfit.top.type === 'shortSleeve' ? 
                            outfit.top.item : 
                            `${outfit.top.item}衬衫 + ${outfit.top.inner}`}
                        </p>
                        <p>
                          <span className="text-gray-600">下装:</span>{' '}
                          {outfit.bottom}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">搭配</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 分页 */}
          {filteredOutfits.length > 0 && (
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white'}`}
              >
                上一页
              </button>
              
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white'}`}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <h2 className="text-lg font-medium mb-4">衣物管理</h2>
          
          {/* 搭配规则提示 */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
            <h3 className="font-medium mb-1">搭配规则说明</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>短袖可以直接和裤子搭配</li>
              <li>内搭必须搭配衬衫一起穿</li>
              <li>所有裤子均可自由搭配</li>
            </ul>
          </div>
          
          {/* 衣物类别管理 */}
          <div className="space-y-4">
            {Object.keys(wardrobe).map(category => (
              <div key={category} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{getCategoryName(category)} ({wardrobe[category].length})</h3>
                  <button 
                    onClick={() => setEditCategory(category)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    编辑
                  </button>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {wardrobe[category].map(item => (
                    <span key={item} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 统计信息 */}
          <div className="mt-6 bg-white p-3 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">搭配统计</h3>
            <p>总衣物数量: {Object.values(wardrobe).flat().length} 件</p>
            <p>可行搭配组合: {outfits.length} 种</p>
            <p>短袖搭配: {outfits.filter(o => o.top.type === 'shortSleeve').length} 种</p>
            <p>衬衫+内搭搭配: {outfits.filter(o => o.top.type === 'shirt').length} 种</p>
          </div>
        </div>
      )}
      
      {renderEditCategory()}
      {renderConfirmRemove()}
    </div>
  );
};

// 渲染应用
ReactDOM.render(<WardrobeApp />, document.getElementById('root'));
