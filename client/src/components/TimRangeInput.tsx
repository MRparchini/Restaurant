import React from "react";
import './TimeRange/timeRangeStyle.css'
type TimeRangeProps = {
    startTime: string,
    endTime: string,
    onTimeChange: (start: string, end: string, duration: string) => void,
    onApply: (start: string, end: string, duration: string) => void
    showDuration: true,
    showActions: true
};

function TimeRange({ 
            startTime = '09:00', 
            endTime = '17:00', 
            onTimeChange,
            onApply,
            showDuration = true,
            showActions = true
        }: TimeRangeProps) {
            
            const [start, setStart] = React.useState(startTime);
            const [end, setEnd] = React.useState(endTime);
            const [duration, setDuration] = React.useState('8 hours 0 minutes');
            
            // Calculate duration when times change
            React.useEffect(() => {
                calculateDuration();
            }, [start, end]);
            
            const calculateDuration = () => {
                if (!start || !end) {
                    setDuration('Invalid time range');
                    return;
                }
                
                const [startHours, startMinutes] = start.split(':').map(Number);
                const [endHours, endMinutes] = end.split(':').map(Number);
                
                let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                
                // Handle overnight case
                if (totalMinutes < 0) {
                    totalMinutes += 24 * 60;
                }
                
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                const durationText = `${hours} hours ${minutes} minutes`;
                setDuration(durationText);
                
                // Notify parent of change
                onTimeChange(start, end, durationText);
            };
            
            const handleStartChange = (e: any) => {
                setStart(e.target.value);
            };
            
            const handleEndChange = (e: any) => {
                setEnd(e.target.value);
            };
            
            const handleApply = () => {
                onApply(start, end, duration);
            };
            
            const handleReset = () => {
                setStart('09:00');
                setEnd('17:00');
            };
            
            return (
                <div className="container">
                    <div className="header">
                        <h1>Time Range Selector</h1>
                    </div>
                    
                    <div className="content">
                        <div className="time-range">
                            <div className="time-input">
                                <label htmlFor="start-time">Start Time</label>
                                <div className="time-input-container">
                                    <i className="fas fa-play-circle"></i>
                                    <input 
                                        type="time" 
                                        id="start-time" 
                                        value={start}
                                        onChange={handleStartChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="time-input">
                                <label htmlFor="end-time">End Time</label>
                                <div className="time-input-container">
                                    <i className="fas fa-stop-circle"></i>
                                    <input 
                                        type="time" 
                                        id="end-time" 
                                        value={end}
                                        onChange={handleEndChange}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {showDuration && (
                            <>
                                <div className="divider">—</div>
                                
                                <div className="duration">
                                    <h3>Total Duration</h3>
                                    <div className="duration-value">{duration}</div>
                                </div>
                            </>
                        )}
                        
                        {showActions && (
                            <div className="actions">
                                <button className="btn-secondary" onClick={handleReset}>
                                    <i className="fas fa-redo"></i> Reset
                                </button>
                                <button className="btn-primary" onClick={handleApply}>
                                    <i className="fas fa-check"></i> Apply
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );

}

export default TimeRange