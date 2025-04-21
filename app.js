const { useState, useEffect } = React;

// 本地存储键名
const WARDROBE_STORAGE_KEY = 'my-wardrobe-data';

const WardrobeApp = () => {
  // 初始默认衣橱数据
  const defaultWardrobe = {
    innerWear: ['吊带', '白吊带', '黑吊带', '灰吊带'],
    shortSleeve: ['茵曼白圆领', '白U领', '黑白条纹', '灰色'],
    longSleeve: ['安踏Polo', '深咖棕', '黑短款卫衣', '黑灰修身', '深灰洞洞针织', '蓝领白针织修身假两件'],
    thickLongSleeve: ['灰色蓝边', '茵曼浅灰翻领', '森马粉色', '茵曼白色混纺麻花', '粉色V领', '烤棉花糖', '对白蓝色艺术款', '黑白条纹'],
    shirt: ['乐町白', '克莱因蓝', '蓝格子', '亮蓝纱'],
    jacket: ['白麂皮', '卡其麂皮', '牛仔', '卡其西装', '香芋紫', '远剑蝴蝶', '远剑绿格子衬衫', '森马白蓝', '冲锋衣', '安踏白底蓝花'],
    thickJacket: ['三色摇粒绒', '深灰大衣', '酱色大衣', '白色短款棉服', '卡其派克服', '小黑袄', '小白袄', '黑色大长袄'],
    pants: ['军绿工装', '薄皮牛仔裤', '森马米白', '逸阳长腿直筒蓝牛仔'],
    skirt: ['牛仔蓝', '灰西装料', '咖色', '黑色优衣库'],
    dress: ['茵曼牛仔背带', '深灰吊带', '卡其背带', '黑棉麻连衣裙', '白纱连衣裙']
  };

  // 状态管理
  const [wardrobe, setWardrobe] = useState(defaultWardrobe);
  const [categoryOrder, setCategoryOrder] = useState(Object.keys(defaultWardrobe));
  const [outfits, setOutfits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('outfits'); 
  const [filters, setFilters] = useState({ top: 'all', middle: 'all', bottom: 'all', dress: 'all' });
  const [editCategory, setEditCategory] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [itemToRemove, setItemToRemove] = useState({ category: '', item: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const outfitsPerPage = 5;

  // 从本地存储加载数据
  useEffect(() => {
    const savedData = localStorage.getItem(WARDROBE_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.wardrobe) setWardrobe(parsedData.wardrobe);
        if (parsedData.categoryOrder) setCategoryOrder(parsedData.categoryOrder);
      } catch (e) {
        console.error('Failed to load wardrobe data:', e);
      }
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify({
      wardrobe,
      categoryOrder
    }));
    // 重新生成搭配
    generateOutfits();
  }, [wardrobe, categoryOrder]);

  // 生成所有可行的搭配组合
  const generateOutfits = () => {
    const allOutfits = [];
    
    // 连衣裙独立搭配
    if (wardrobe.dress) {
      wardrobe.dress.forEach(dress => {
        allOutfits.push({
          type: 'dress',
          dress: dress
        });
      });
    }
    
    // 底装
    const bottoms = [];
    if (wardrobe.pants) {
      wardrobe.pants.forEach(item => bottoms.push({ type: 'pants', item }));
    }
    if (wardrobe.skirt) {
      wardrobe.skirt.forEach(item => bottoms.push({ type: 'skirt', item }));
    }
    
    // 情况1: 短袖 + 底装
    if (wardrobe.shortSleeve) {
      wardrobe.shortSleeve.forEach(top => {
        bottoms.forEach(bottom => {
          allOutfits.push({
            type: 'outfit',
            top: { type: 'shortSleeve', item: top },
            bottom: bottom
          });
        });
      });
    }
    
    // 情况2: 长袖 + 底装
    if (wardrobe.longSleeve) {
      wardrobe.longSleeve.forEach(top => {
        bottoms.forEach(bottom => {
          allOutfits.push({
            type: 'outfit',
            top: { type: 'longSleeve', item: top },
            bottom: bottom
          });
        });
      });
    }
    
    // 情况3: 厚长袖 + 底装
    if (wardrobe.thickLongSleeve) {
      wardrobe.thickLongSleeve.forEach(top => {
        bottoms.forEach(bottom => {
          allOutfits.push({
            type: 'outfit',
            top: { type: 'thickLongSleeve', item: top },
            bottom: bottom
          });
        });
      });
    }
    
    // 情况4: 衬衫 + 吊带 + 底装
    if (wardrobe.shirt && wardrobe.innerWear) {
      wardrobe.shirt.forEach(shirt => {
        wardrobe.innerWear.forEach(inner => {
          bottoms.forEach(bottom => {
            allOutfits.push({
              type: 'outfit',
              top: { type: 'shirt', item: shirt, inner: inner },
              bottom: bottom
            });
          });
        });
      });
    }
    
    // 情况5: 外套 + 短袖/长袖 + 底装
    if (wardrobe.jacket) {
      wardrobe.jacket.forEach(jacket => {
        // 外套 + 短袖
        if (wardrobe.shortSleeve) {
          wardrobe.shortSleeve.forEach(inner => {
            bottoms.forEach(bottom => {
              allOutfits.push({
                type: 'outfit',
                top: { type: 'jacket', item: jacket, inner: { type: 'shortSleeve', item: inner } },
                bottom: bottom
              });
            });
          });
        }
        
        // 外套 + 长袖
        if (wardrobe.longSleeve) {
          wardrobe.longSleeve.forEach(inner => {
            bottoms.forEach(bottom => {
              allOutfits.push({
                type: 'outfit',
                top: { type: 'jacket', item: jacket, inner: { type: 'longSleeve', item: inner } },
                bottom: bottom
              });
            });
          });
        }
      });
    }
    
    // 情况6: 厚外套 + 长袖/厚长袖 + 底装
    if (wardrobe.thickJacket) {
      wardrobe.thickJacket.forEach(jacket => {
        // 厚外套 + 长袖
        if (wardrobe.longSleeve) {
          wardrobe.longSleeve.forEach(inner => {
            bottoms.forEach(bottom => {
              allOutfits.push({
                type: 'outfit',
                top: { type: 'thickJacket', item: jacket, inner: { type: 'longSleeve', item: inner } },
                bottom: bottom
              });
            });
          });
        }
        
        // 厚外套 + 厚长袖
        if (wardrobe.thickLongSleeve) {
          wardrobe.thickLongSleeve.forEach(inner => {
            bottoms.forEach(bottom => {
              allOutfits.push({
                type: 'outfit',
                top: { type: 'thickJacket', item: jacket, inner: { type: 'thickLongSleeve', item: inner } },
                bottom: bottom
              });
            });
          });
        }
      });
    }
    
    setOutfits(allOutfits);
  };

  // 过滤搭配
  const filteredOutfits = outfits.filter(outfit => {
    // 连衣裙过滤
    if (outfit.type === 'dress') {
      if (filters.dress !== 'all' && outfit.dress !== filters.dress) {
        return false;
      }
      return true;
    }
    
    // 常规搭配过滤
    // 上层过滤（外套/厚外套）
    if (filters.top !== 'all') {
      const [type, item] = filters.top.split('-');
      if (type === 'jacket' && (!outfit.top.type || outfit.top.type !== 'jacket' || outfit.top.item !== item)) {
        return false;
      }
      if (type === 'thickJacket' && (!outfit.top.type || outfit.top.type !== 'thickJacket' || outfit.top.item !== item)) {
        return false;
      }
    }
    
    // 中层过滤（短袖/长袖/厚长袖/衬衫/内搭）
    if (filters.middle !== 'all') {
      const [type, item] = filters.middle.split('-');
      
      // 内搭必须与衬衫一起才有效
      if (type === 'innerWear') {
        if (!outfit.top.inner || outfit.top.type !== 'shirt' || outfit.top.inner !== item) {
          return false;
        }
      } 
      // 直接穿的上衣
      else if (type === 'shortSleeve' || type === 'longSleeve' || type === 'thickLongSleeve') {
        if (outfit.top.type === 'jacket' || outfit.top.type === 'thickJacket') {
          if (!outfit.top.inner || outfit.top.inner.type !== type || outfit.top.inner.item !== item) {
            return false;
          }
        } else if (outfit.top.type !== type || outfit.top.item !== item) {
          return false;
        }
      }
      // 衬衫作为上衣
      else if (type === 'shirt') {
        if (outfit.top.type !== 'shirt' || outfit.top.item !== item) {
          return false;
        }
      }
    }
    
    // 底装过滤
    if (filters.bottom !== 'all') {
      const [type, item] = filters.bottom.split('-');
      if (!outfit.bottom || outfit.bottom.type !== type || outfit.bottom.item !== item) {
        return false;
      }
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
      [category]: [...(prev[category] || []), newItemName.trim()]
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

  // 添加新类别
  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // 创建新类别
    setWardrobe(prev => ({
      ...prev,
      [newCategoryName.trim()]: []
    }));
    
    // 更新类别顺序
    setCategoryOrder(prev => [...prev, newCategoryName.trim()]);
    
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  // 删除类别
  const removeCategory = (category) => {
    // 从衣橱数据中删除
    setWardrobe(prev => {
      const updated = {...prev};
      delete updated[category];
      return updated;
    });
    
    // 从类别顺序中删除
    setCategoryOrder(prev => prev.filter(c => c !== category));
  };

  // 获取分类名称
  const getCategoryName = (category) => {
    const nameMap = {
      innerWear: '内搭',
      shortSleeve: '短袖',
      longSleeve: '长袖',
      thickLongSleeve: '厚长袖',
      shirt: '衬衫',
      jacket: '外套',
      thickJacket: '厚外套',
      pants: '裤子',
      skirt: '半身裙',
      dress: '连衣裙'
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
            {wardrobe[editCategory] && wardrobe[editCategory].length > 0 ? (
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
            ) : (
              <p className="text-gray-500 text-center py-2">暂无项目</p>
            )}
          </div>
          
          <div className="flex justify-between">
            {editCategory !== 'innerWear' && 
             editCategory !== 'shortSleeve' && 
             editCategory !== 'longSleeve' && 
             editCategory !== 'thickLongSleeve' && 
             editCategory !== 'shirt' && 
             editCategory !== 'jacket' && 
             editCategory !== 'thickJacket' && 
             editCategory !== 'pants' && 
             editCategory !== 'skirt' && 
             editCategory !== 'dress' && (
              <button 
                onClick={() => {
                  if (confirm(`确定要删除"${getCategoryName(editCategory)}"类别吗？`)) {
                    removeCategory(editCategory);
                    setEditCategory(null);
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                删除类别
              </button>
            )}
            <button 
              onClick={() => setEditCategory(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded ml-auto"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 显示添加类别界面
  const renderAddCategory = () => {
    if (!showAddCategory) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
        <div className="bg-white rounded-lg p-4 w-full max-w-md">
          <h3 className="font-bold text-lg mb-4">添加新类别</h3>
          
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入新类别名称"
                className="flex-1 p-2 border rounded"
              />
              <button 
                onClick={addCategory}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                添加
              </button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddCategory(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              取消
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

  // 获取衣物分类
  const renderCategoryFilters = () => {
    // 上层（外套/厚外套）
    const topCategories = ['jacket', 'thickJacket'];
    
    // 中层（短袖/长袖/厚长袖/衬衫/内搭）
    const middleCategories = ['shortSleeve', 'longSleeve', 'thickLongSleeve', 'shirt', 'innerWear'];
    
    // 底层（裤子/半身裙）
    const bottomCategories = ['pants', 'skirt'];
    
    // 连衣裙单独一类
    const dressCategory = 'dress';
    
    return (
      <div className="space-y-3">
        {/* 连衣裙筛选 */}
        <div>
          <label className="block text-sm font-medium mb-1">连衣裙:</label>
          <select 
            className="w-full p-2 border rounded"
            value={filters.dress}
            onChange={(e) => setFilters({...filters, dress: e.target.value})}
          >
            <option value="all">所有连衣裙</option>
            {wardrobe[dressCategory] && wardrobe[dressCategory].map(item => (
              <option key={`dress-${item}`} value={item}>{item}</option>
            ))}
          </select>
        </div>
        
        {/* 上层筛选 */}
        <div>
          <label className="block text-sm font-medium mb-1">外套筛选:</label>
          <select 
            className="w-full p-2 border rounded"
            value={filters.top}
            onChange={(e) => setFilters({...filters, top: e.target.value})}
          >
            <option value="all">所有/无外套</option>
            {topCategories.map(category => (
              wardrobe[category] && (
                <optgroup key={category} label={getCategoryName(category)}>
                  {wardrobe[category].map(item => (
                    <option key={`${category}-${item}`} value={`${category}-${item}`}>{item}</option>
                  ))}
                </optgroup>
              )
            ))}
          </select>
        </div>
        
        {/* 中层筛选 */}
        <div>
          <label className="block text-sm font-medium mb-1">上衣筛选:</label>
          <select 
            className="w-full p-2 border rounded"
            value={filters.middle}
            onChange={(e) => setFilters({...filters, middle: e.target.value})}
          >
            <option value="all">所有上衣</option>
            {middleCategories.map(category => (
              wardrobe[category] && (
                <optgroup key={category} label={getCategoryName(category)}>
                  {wardrobe[category].map(item => (
                    <option key={`${category}-${item}`} value={`${category}-${item}`}>{item}</option>
                  ))}
                </optgroup>
              )
            ))}
          </select>
        </div>
        
        {/* 底层筛选 */}
        <div>
          <label className="block text-sm font-medium mb-1">下装筛选:</label>
          <select 
            className="w-full p-2 border rounded"
            value={filters.bottom}
            onChange={(e) => setFilters({...filters, bottom: e.target.value})}
          >
            <option value="all">所有下装</option>
            {bottomCategories.map(category => (
              wardrobe[category] && (
                <optgroup key={category} label={getCategoryName(category)}>
                  {wardrobe[category].map(item => (
                    <option key={`${category}-${item}`} value={`${category}-${item}`}>{item}</option>
                  ))}
                </optgroup>
              )
            ))}
          </select>
        </div>
      </div>
    );
  };

  // 渲染搭配组合
  const renderOutfit = (outfit, index) => {
    if (outfit.type === 'dress') {
      return (
        <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
          <h3 className="font-medium text-sm text-gray-500 mb-1">
            搭配 #{indexOfFirstOutfit + index + 1}
          </h3>
          <div className="flex items-center">
            <div className="flex-1">
              <p>
                <span className="text-gray-600">连衣裙:</span>{' '}
                {outfit.dress}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-500">搭配</span>
            </div>
          </div>
        </div>
      );
    }
    
    // 常规搭配
    let topDescription = '';
    if (outfit.top.type === 'jacket' || outfit.top.type === 'thickJacket') {
      // 外套 + 内层
      const outerType = outfit.top.type === 'jacket' ? '外套' : '厚外套';
      const innerType = outfit.top.inner.type === 'shortSleeve' ? '短袖' : 
                        outfit.top.inner.type === 'longSleeve' ? '长袖' : '厚长袖';
      topDescription = `${outfit.top.item}(${outerType}) + ${outfit.top.inner.item}(${innerType})`;
    } else if (outfit.top.type === 'shirt') {
      // 衬衫 + 内搭
      topDescription = `${outfit.top.item}(衬衫) + ${outfit.top.inner}(内搭)`;
    } else {
      // 单件上衣
      const topType = outfit.top.type === 'shortSleeve' ? '短袖' : 
                      outfit.top.type === 'longSleeve' ? '长袖' : '厚长袖';
      topDescription = `${outfit.top.item}(${topType})`;
    }
    
    const bottomType = outfit.bottom.type === 'pants' ? '裤子' : '半身裙';
    
    return (
      <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
        <h3 className="font-medium text-sm text-gray-500 mb-1">
          搭配 #{indexOfFirstOutfit + index + 1}
        </h3>
        <div className="flex items-center">
          <div className="flex-1">
            <p className="mb-1">
              <span className="text-gray-600">上装:</span>{' '}
              {topDescription}
            </p>
            <p>
              <span className="text-gray-600">下装:</span>{' '}
              {outfit.bottom.item}({bottomType})
            </p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">搭配</span>
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
            {renderCategoryFilters()}
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
                {currentOutfits.map((outfit, index) => renderOutfit(outfit, index))}
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">衣物管理</h2>
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              添加类别
            </button>
          </div>
          
          {/* 搭配规则提示 */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
            <h3 className="font-medium mb-1">搭配规则说明</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>连衣裙可以独立成为一套搭配</li>
              <li>短袖/长袖/厚长袖可以直接与裤子或半身裙搭配</li>
              <li>吊带必须与衬衫一起才能与下装搭配</li>
              <li>外套可以与短袖或长袖一起搭配</li>
              <li>厚外套可以与长袖或厚长袖一起搭配</li>
            </ul>
          </div>
          
          {/* 衣物类别管理 */}
          <div className="space-y-4">
            {categoryOrder.filter(category => wardrobe[category]).map(category => (
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
                  {wardrobe[category].slice(0, 5).map(item => (
                    <span key={item} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                  {wardrobe[category].length > 5 && (
                    <span className="text-sm text-blue-500">+{wardrobe[category].length - 5}个</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* 统计信息 */}
          <div className="mt-6 bg-white p-3 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">搭配统计</h3>
            <p>总衣物数量: {Object.values(wardrobe).flat().length} 件</p>
            <p>可行搭配组合: {outfits.length} 种</p>
            <p>连衣裙搭配: {outfits.filter(o => o.type === 'dress').length} 种</p>
            <p>含外套搭配: {outfits.filter(o => o.type === 'outfit' && (o.top.type === 'jacket' || o.top.type === 'thickJacket')).length} 种</p>
            <p>含半身裙搭配: {outfits.filter(o => o.type === 'outfit' && o.bottom.type === 'skirt').length} 种</p>
          </div>
        </div>
      )}
      
      {renderEditCategory()}
      {renderConfirmRemove()}
      {renderAddCategory()}
    </div>
  );
};

// 渲染应用
ReactDOM.render(<WardrobeApp />, document.getElementById('root'));
