'use client';
import type React from 'react';
import { useEffect } from 'react';
import { useGlobal } from '@/contexts/GlobalContext';

const Bgm:React.FC = ()=>{
  const {playSound,getAudioRef,stopSound} = useGlobal();
  const bgmRef = getAudioRef("bgm");
  console.log(bgmRef)
 
   useEffect(() => {
     playSound('bgm');
 
     // 添加多种用户交互事件监听，用于解决浏览器的自动播放限制
     const handleUserInteraction = () => {
       playSound('bgm');
       // 移除所有事件监听器
       document.removeEventListener('click', handleUserInteraction);
       document.removeEventListener('keydown', handleUserInteraction);
       document.removeEventListener('touchstart', handleUserInteraction);
       document.removeEventListener('mousemove', handleUserInteraction);
     };
 
     // 监听多种用户交互事件
     document.addEventListener('click', handleUserInteraction);
     document.addEventListener('keydown', handleUserInteraction);
     document.addEventListener('touchstart', handleUserInteraction);
     document.addEventListener('mousemove', handleUserInteraction);
 
     // 组件卸载时清理
     return () => {
       stopSound('bgm');
       // 清理事件监听器
       document.removeEventListener('click', handleUserInteraction);
       document.removeEventListener('keydown', handleUserInteraction);
       document.removeEventListener('touchstart', handleUserInteraction);
       document.removeEventListener('mousemove', handleUserInteraction);
     };
   }, [bgmRef]);
  return <></>
}

export default Bgm;