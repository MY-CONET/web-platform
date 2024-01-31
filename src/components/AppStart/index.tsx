import React, { useState, useEffect, useRef } from 'react';
import { getDappListData, activeDapp } from '../../API/index'
import './index.scss'

import { renderZipTree } from '../../utils/renderZip'
interface AppStartProps {
  name: string;
  icon: string;
  id: string;
  zipName: string;
}
const AppStart = () => {
  const [appList, setAppList] = useState<AppStartProps[]>([])
  const iframeUrl = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getDappListData()
      setAppList(data)
    }
    fetchData()
  }, [])

  const handleActiveApps = async (e: AppStartProps) => {
    const { data } = await activeDapp(e.zipName)

    const html = await renderZipTree(data)
    const iframeDom = iframeUrl.current
    iframeDom!.contentWindow!.document.write(html)
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
      </div>
      <div className='workspace'>
        <iframe src="about:blank" ref={iframeUrl}></iframe>
      </div>
    </div>
  );
}

export default AppStart;