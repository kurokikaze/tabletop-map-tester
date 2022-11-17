import { useCallback, useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import { HistoryEntry } from '../types'
import FullMap from '../FullMap'
import VisitMap from '../VisitMap/VisitMap'
import Checkbox from '@mui/material/Checkbox'

type HistoryPlayerProps = {
    history: HistoryEntry[]
    onClose: () => void
}

export default function HistoryPlayer({ history, onClose }: HistoryPlayerProps) {
  const [currentFrame, setCurrentFrame] = useState<number>(0)
  const [playing, setPlaying] = useState<boolean>(false)
  const [showVisitMap, setShowVisitMap] = useState<boolean>(false) 
  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer>()

  const handleAdvanceFrame = useCallback(() => {
    setCurrentFrame(frame => frame < history.length - 1 ? frame + 1 : 0)
  }, [history])
  
  const handlePlay = useCallback(() => {
    setPlaying(true)
    setIntervalTimer(setInterval(handleAdvanceFrame, 1000))
  }, [handleAdvanceFrame])

  const handleChangeVisit = useCallback(() => setShowVisitMap(value => !value), [])

  const handlePause = useCallback(() => {
    if (playing) {
      setPlaying(false)
      clearInterval(Number(intervalTimer))
    }
  }, [intervalTimer, playing])

  useEffect(() => {
    setCurrentFrame(0)
  }, [history])

return (<div className="historyPlayer">
    {currentFrame in history && <>
      <FullMap map={history[currentFrame].map} selectedCell={null} />
      {showVisitMap ? <VisitMap history={history[currentFrame]}/> : null}
    </>}
{playing ? <Button onClick={handlePause}>Пауза ({currentFrame + 1} из {history.length})</Button> : <Button onClick={handlePlay}>Запуск</Button>}
    <Button onClick={onClose}>Закрыть плеер</Button>
    <label><Checkbox checked={showVisitMap} onChange={handleChangeVisit} />Раскрашивать посещённые поля</label>
  </div>)
}
