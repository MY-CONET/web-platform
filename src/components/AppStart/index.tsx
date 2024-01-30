import React, { useState, useEffect } from 'react';
import { getDappListData, activeDapp } from '../../API/index'
import './index.scss'
interface AppStartProps {
  name: string;
  icon: string;
  id: string;
  zipName: string;
}
const AppStart = () => {
  const [appList, setAppList] = useState<AppStartProps[]>([])
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getDappListData()
      setAppList(data)
    }
    fetchData()
  }, [])

  const handleActiveApps = async (e: AppStartProps) => {
    const { data } = await activeDapp(e.zipName)
    console.log(data)
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
      <div className='workspace'></div>
    </div>
  );
}

export default AppStart;