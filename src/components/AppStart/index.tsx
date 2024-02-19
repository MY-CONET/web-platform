import React, { useState, useEffect, useRef } from 'react';
import { getDappListData, activeDapp } from '../../API/index'
import './index.scss'

import platformApi from '../../PlatformAPI/index'

import { renderZipTree } from '../../utils/renderZip'
interface AppStartProps {
  name: string;
  icon: string;
  id: string;
  zipName: string;
}

// 定义appStartApi的类型
type AppStartApiType = {
  getUser: (data?: any) => Promise<unknown>;
  getSystemConfig: (data?: any) => Promise<unknown>;
};
interface EventData {
  name: string;
  uuid: string;
  data: any;
}
const AppStart = () => {
  const [appList, setAppList] = useState<AppStartProps[]>([])
  const iframeUrl = useRef<HTMLIFrameElement>(null)

  const [userList] = useState<any[]>([
    { name: '张三', age: 18 },
    { name: '李四', age: 20 },
  ])

  // 当前登录用户
  const [user, setUser] = useState<any>(null)
  const userRef = useRef(user); // 使用useRef来跟踪最新的user状态

  const appStartApi: AppStartApiType = {
    ...platformApi,
    // 获取用户信息
    getUser: async (...args: any[]) => {
      return new Promise((resolve, reject) => {
        resolve(userRef.current);
      })
    },
  }

  // 类型保护函数
  function isKeyOfAppStartApi(key: string): key is keyof AppStartApiType {
    return key in appStartApi;
  }

  // 响应iframe发送的消息
  async function receiveMessage(event: MessageEvent<EventData>) {
    // 是否是提供的API
    const isPlatformApi = isKeyOfAppStartApi(event.data.name)
    console.log('是否平台提供的API', appStartApi, isPlatformApi)
    if (isPlatformApi) {
      const methodName = event.data.name as keyof AppStartApiType;  // 我们已经检查了event.data.name是一个合法的键，可以使用类型断言
      const resData = {
        command: event.data.name + event.data.uuid,
        response: await appStartApi[methodName](event.data.data)
      }
      // 发送数据
      console.log('父页面发送数据', resData);
      if (event.source) {
        event.source.postMessage(resData, {
          targetOrigin: event.origin
        });
      }
    } else {
      console.log('不是平台提供的API')
      // 如果不是平台提供的API，就是自定义的API
      if (event.data.name === 'loginUserChange_Callback') {
        setIsSwitching(false); // 切换成功
      }
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getDappListData()
      setAppList(data)
    }
    fetchData()
    setUser(userList[0])
  }, [])

  useEffect(() => {
    userRef.current = user; // 更新ref的值
    const iframeDom = iframeUrl.current
    iframeDom!.onload = () => {
      window.addEventListener('message', async (e) => {
        await receiveMessage(e)
      });
      const params = {
        type: 'loginUserChange',
        data: user,
      }
      iframePost(params)
    }
  }, [user])



  const handleActiveApps = async (e: AppStartProps) => {
    const { data } = await activeDapp(e.zipName)
    console.log('🚀  file: index.tsx:109  handleActiveApps  data:', data)
    // const html = await renderZipTree(data)
    // const iframeDom = iframeUrl.current
    // iframeDom!.contentWindow!.document.write(html)
  }




  // iframe切换用户。如果长时间没有切换成功，就提示用户切换失败
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  // 标记切换的次数，用来触发useEffect
  const [switchCount, setSwitchCount] = useState<number>(0);
  const timerId = useRef<number | null>(null); // 用于存储定时器ID，以便于清除

  // 切换失败后，覆盖iframe的内容
  const [iframeContent, setIframeContent] = useState<string>('');


  const changeUser = async () => {
    // 切换用户
    const index = userList.findIndex(item => item.name === user.name)
    const nextIndex = index === 0 ? 1 : 0
    await setUser(userList[nextIndex])

    const params = {
      type: 'loginUserChange',
      data: userList[nextIndex],
    }
    iframePost(params)
    setIsSwitching(true); // 开始切换账号
    setSwitchCount(switchCount + 1); // 触发useEffect
    setIframeContent('')
  }

  useEffect(() => {
    // 清除之前的定时器（如果有）
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    if (isSwitching) {
      // 设置一个新的定时器
      timerId.current = window.setTimeout(() => {
        console.log('fsahasfjk', isSwitching)
        if (isSwitching) {
          // alert('没有切换成功'); // 显示alert
          setIsSwitching(false); // 重置状态
          setIframeContent('loading...')
        }
      }, 3000); // 3秒后执行
    }
  }, [isSwitching, switchCount]); // 依赖于isSwitching，当它变化时执行


  const iframePost = (message: any) => {
    const iframeDom = iframeUrl.current
    iframeDom!.contentWindow!.postMessage(message, '*')
  }

  return (
    <div className="AppStart">
      <div className='left-bar' >
        {appList.map((item, index) => {
          return (
            <div key={index} className='app-item' onClick={() => {
              handleActiveApps(item)
            }}>
              <img src={`http://localhost:13001/uploads/${item.icon}`} className='app-icon' alt="" />
              <div>{item.name}</div>
            </div>
          )
        })}
        {user && <div className='bottom' onClick={changeUser}>
          <div className='user'>{user.name}</div>
        </div>}

      </div>
      <div className={`workspace ${iframeContent ? 'loading' : ''}`} >
        {isSwitching && <div className='isSwitching'>加载中...</div>}
        {/* <iframe src="about:blank" ref={iframeUrl}></iframe> */}
        <iframe src="http://localhost:3002/" title="appTitle" ref={iframeUrl}></iframe>
      </div>
    </div >
  );
}

export default AppStart;