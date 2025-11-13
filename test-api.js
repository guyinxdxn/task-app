// API测试脚本
const API_BASE = 'http://localhost:3000/api/tasks';

async function testAPI() {
  console.log('开始测试任务管理API...\n');

  try {
    // 1. 测试获取任务列表
    console.log('1. 测试获取任务列表...');
    const getResponse = await fetch(API_BASE);
    const tasks = await getResponse.json();
    console.log(`✅ 获取成功，当前有 ${tasks.length} 个任务`);

    // 2. 测试创建新任务
    console.log('\n2. 测试创建新任务...');
    const newTask = {
      title: '测试任务',
      content: '这是一个测试任务的内容，包含一些详细信息。'
    };
    
    const createResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    
    const createdTask = await createResponse.json();
    console.log('✅ 创建成功，任务ID:', createdTask.id);

    // 3. 测试获取单个任务
    console.log('\n3. 测试获取单个任务...');
    const singleResponse = await fetch(`${API_BASE}/${createdTask.id}`);
    const singleTask = await singleResponse.json();
    console.log('✅ 获取成功，任务标题:', singleTask.title);

    // 4. 测试更新任务
    console.log('\n4. 测试更新任务...');
    const updateData = {
      title: '更新后的测试任务',
      content: '这是更新后的内容',
      completed: true
    };
    
    const updateResponse = await fetch(`${API_BASE}/${createdTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const updatedTask = await updateResponse.json();
    console.log('✅ 更新成功，任务状态:', updatedTask.completed ? '已完成' : '未完成');

    // 5. 测试删除任务
    console.log('\n5. 测试删除任务...');
    const deleteResponse = await fetch(`${API_BASE}/${createdTask.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ 删除成功');
    }

    console.log('\n🎉 所有API测试通过！');

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

testAPI();