// FILE: src/components/settings/ServiceHoursTab.jsx
import React from 'react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ServiceHoursTab({ formData, setFormData, isEditingHours, setIsEditingHours, hoveredCard, setHoveredCard }) {

  const handleHourChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceHours: { ...prev.serviceHours, [day]: { ...prev.serviceHours[day], [field]: value } }
    }));
  };

  const calculateBreakDuration = (end1, start2) => {
    try {
      const [h1, m1] = (end1 || '14:00').split(':').map(Number);
      const [h2, m2] = (start2 || '17:00').split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff <= 0) return 'Overlapping';
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } catch (e) {
      return '3h';
    }
  };

  return (
    <div style={S.sectionGroup}>
      <div style={S.serviceHoursBanner}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 22}}>⏰</span>
          <div>
            <div style={{fontWeight: 900, color: '#0369a1', fontSize: 15}}>Online Ordering Hours</div>
            <div style={{fontSize: 12, color: '#0c4a6e', marginTop: 3, fontWeight: 800}}>
              Configure working days with multiple shifts. Gaps between shifts are treated as breaks automatically.
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setIsEditingHours(!isEditingHours)} style={S.editHoursBtn}>
          ✏️ {isEditingHours ? 'Lock Hours' : 'Edit Hours'}
        </button>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10}}>
        {daysOfWeek.map(day => {
          const dayData = formData.serviceHours?.[day] || { open: true, holiday: false, shift1Start: '09:00', shift1End: '14:00', shift2Start: '17:00', shift2End: '22:00' };
          const breakDuration = calculateBreakDuration(dayData.shift1End, dayData.shift2Start);
          const isHovered = hoveredCard === day;

          return (
            <div key={day} style={{...S.dayCard, ...(isHovered ? S.dayCardHover : {})}} onMouseEnter={() => setHoveredCard(day)} onMouseLeave={() => setHoveredCard(null)}>
              <div style={S.dayCardHeader}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <span style={{fontWeight: 900, fontSize: 16, color: '#0f172a', width: 110}}>{day}</span>
                  <span style={{backgroundColor: dayData.holiday ? '#fef2f2' : '#ecfdf5', color: dayData.holiday ? '#dc2626' : '#059669', padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 900, border: '1px solid currentColor'}}>
                    {dayData.holiday ? 'Holiday' : 'Open'}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{fontSize: 12, fontWeight: 900, color: '#0f172a'}}>Holiday</span>
                  <input type="checkbox" checked={dayData.holiday || false} onChange={e => handleHourChange(day, 'holiday', e.target.checked)} style={{width: 18, height: 18, cursor: 'pointer', accentColor: '#059669'}} />
                </div>
              </div>

              {!dayData.holiday && (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14}}>
                  <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
                    <input type="text" value={dayData.shift1Start} onChange={e => handleHourChange(day, 'shift1Start', e.target.value)} disabled={!isEditingHours} style={S.timeInput} />
                    <span style={{fontWeight: 900, color: '#334155'}}>to</span>
                    <input type="text" value={dayData.shift1End} onChange={e => handleHourChange(day, 'shift1End', e.target.value)} disabled={!isEditingHours} style={S.timeInput} />
                  </div>
                  <div style={{textAlign: 'center', fontSize: 12, fontWeight: 900, color: '#b45309', backgroundColor: '#fef3c7', padding: 8, borderRadius: 8, border: '1.5px dashed #f59e0b'}}>
                    Break {dayData.shift1End}–{dayData.shift2Start} ({breakDuration})
                  </div>
                  <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
                    <input type="text" value={dayData.shift2Start} onChange={e => handleHourChange(day, 'shift2Start', e.target.value)} disabled={!isEditingHours} style={S.timeInput} />
                    <span style={{fontWeight: 900, color: '#334155'}}>to</span>
                    <input type="text" value={dayData.shift2End} onChange={e => handleHourChange(day, 'shift2End', e.target.value)} disabled={!isEditingHours} style={S.timeInput} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S = {
  sectionGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  serviceHoursBanner: { backgroundColor: '#e0f2fe', border: '2px solid #7dd3fc', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editHoursBtn: { backgroundColor: '#fff', color: '#0369a1', border: '2px solid #38bdf8', padding: '8px 16px', borderRadius: 10, fontWeight: 900, fontSize: 12, cursor: 'pointer' },
  dayCard: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: 14, padding: 18, transition: 'all 0.25s ease' },
  dayCardHover: { borderColor: '#059669', backgroundColor: '#f0fdf4', transform: 'translateY(-2px)' },
  dayCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeInput: { padding: '8px 14px', borderRadius: 8, border: '2px solid #94a3b8', fontSize: 13, fontWeight: 900, color: '#0f172a', backgroundColor: '#fff', width: 150, outline: 'none' }
};